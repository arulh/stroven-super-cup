"""Signature verification for admin writes.

Admins hold an Ed25519 private key that is generated inside their browser as a
non-extractable CryptoKey and never leaves the device. Only the public key is
registered in ``api_keys``. Every write is signed over a canonical string that
binds the method, path, key id, timestamp, nonce and a hash of the exact request
body, so a captured request cannot be replayed or edited in flight.
"""

import base64
import hashlib
import re
import time
from datetime import datetime, timedelta

from nacl.exceptions import BadSignatureError, CryptoError
from nacl.signing import VerifyKey
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models import AdminNonce, ApiKey

SCHEME = "SSC-ED25519-V1"

HEADER_KEY_ID = "x-ssc-key-id"
HEADER_TIMESTAMP = "x-ssc-timestamp"
HEADER_NONCE = "x-ssc-nonce"
HEADER_SIGNATURE = "x-ssc-signature"

ED25519_PUBLIC_KEY_BYTES = 32
ED25519_SIGNATURE_BYTES = 64

NONCE_RE = re.compile(r"^[0-9a-f]{32,64}$")


class AdminAuthError(Exception):
    """Raised when a signed admin request cannot be trusted."""


def key_id_for(public_key: bytes) -> str:
    """Key ids are derived from the public key, so an admin cannot hand over a
    key id and a public key that do not belong together."""
    return hashlib.sha256(public_key).hexdigest()[:16]


def canonical_request(method: str, path: str, key_id: str, ts: str, nonce: str,
                      body_bytes: bytes) -> bytes:
    body_hash = hashlib.sha256(body_bytes).hexdigest()
    parts = [SCHEME, method.upper(), path, key_id, ts, nonce, body_hash]
    return "\n".join(parts).encode()


def verify_admin_request(db: Session, headers, method: str, path: str, body_bytes: bytes,
                         max_skew: int, nonce_ttl: int) -> ApiKey:
    """Return the ApiKey that signed this request, or raise AdminAuthError.

    On success a nonce row is pending in ``db``; committing the caller's
    transaction is what actually spends it.
    """
    key_id = headers.get(HEADER_KEY_ID)
    ts = headers.get(HEADER_TIMESTAMP)
    nonce = headers.get(HEADER_NONCE)
    sig_b64 = headers.get(HEADER_SIGNATURE)
    if not all([key_id, ts, nonce, sig_b64]):
        raise AdminAuthError("Missing signature headers")

    try:
        ts_int = int(ts)
    except ValueError:
        raise AdminAuthError("Invalid timestamp")
    if abs(int(time.time()) - ts_int) > max_skew:
        raise AdminAuthError("Timestamp outside allowed window")

    if not NONCE_RE.match(nonce):
        raise AdminAuthError("Invalid nonce")

    api_key = db.get(ApiKey, key_id)
    if api_key is None or api_key.revoked_at is not None or not api_key.can_write:
        raise AdminAuthError("Key not authorized")

    try:
        public_key = base64.b64decode(api_key.public_key_b64, validate=True)
        signature = base64.b64decode(sig_b64, validate=True)
    except ValueError:
        raise AdminAuthError("Malformed key or signature encoding")

    if len(public_key) != ED25519_PUBLIC_KEY_BYTES:
        raise AdminAuthError("Registered public key is not a 32-byte Ed25519 key")
    if len(signature) != ED25519_SIGNATURE_BYTES:
        raise AdminAuthError("Signature is not 64 bytes")

    message = canonical_request(method, path, key_id, ts, nonce, body_bytes)
    try:
        VerifyKey(public_key).verify(message, signature)
    except (BadSignatureError, CryptoError):
        raise AdminAuthError("Bad signature")

    # Only a caller that has already proved possession of the key may spend a
    # nonce, otherwise anyone could fill the table with garbage.
    _spend_nonce(db, key_id, nonce, nonce_ttl, max_skew)
    return api_key


def _spend_nonce(db: Session, key_id: str, nonce: str, nonce_ttl: int, max_skew: int) -> None:
    now = datetime.utcnow()

    # A nonce must outlive the timestamp window it was accepted in, or a request
    # could be replayed after its nonce expired but before its timestamp did.
    ttl = max(nonce_ttl, max_skew * 2)

    db.query(AdminNonce).filter(AdminNonce.expires_at < now).delete(synchronize_session=False)

    if db.get(AdminNonce, (key_id, nonce)) is not None:
        raise AdminAuthError("Replay detected: nonce already used")

    db.add(AdminNonce(
        key_id=key_id,
        nonce=nonce,
        created_at=now,
        expires_at=now + timedelta(seconds=ttl),
    ))
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise AdminAuthError("Replay detected: nonce already used")

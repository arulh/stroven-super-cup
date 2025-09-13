import base64, hashlib, time, uuid
from datetime import datetime, timedelta
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError
from sqlalchemy.orm import Session
from models import ApiKey, Nonce

class AuthError(Exception):
    pass

def _sha256_hex(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def verify_signed_request(db: Session, headers: dict, method: str, path: str, body_bytes: bytes,
                           max_skew: int, nonce_ttl: int):
    key_id = headers.get("x-key-id")
    ts = headers.get("x-timestamp")
    nonce = headers.get("x-nonce")
    sig_b64 = headers.get("x-signature")
    if not all([key_id, ts, nonce, sig_b64]):
        raise AuthError("Missing required auth headers")

    try:
        ts_int = int(ts)
    except ValueError:
        raise AuthError("Invalid timestamp")

    now = int(time.time())
    if abs(now - ts_int) > max_skew:
        raise AuthError("Timestamp skew too large")

    # Nonce replay protection
    if db.get(Nonce, nonce) is not None:
        raise AuthError("Replay detected: nonce already used")
    expires = datetime.utcnow() + timedelta(seconds=nonce_ttl)
    db.add(Nonce(nonce=nonce, expires_at=expires))

    api_key = db.get(ApiKey, key_id)
    if not api_key or api_key.revoked_at is not None or not api_key.can_write:
        raise AuthError("Key not authorized")

    public_key = base64.b64decode(api_key.public_key_b64)
    verify_key = VerifyKey(public_key)

    canonical = f"{method}\n{path}\n{ts}\n{nonce}\n{_sha256_hex(body_bytes)}".encode()
    try:
        verify_key.verify(canonical, base64.b64decode(sig_b64))
    except BadSignatureError:
        raise AuthError("Bad signature")

    return api_key
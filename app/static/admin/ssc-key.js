// Admin signing key, held in this browser only.
//
// The private key is generated as a non-extractable CryptoKey, so it cannot be
// read back out of IndexedDB by any script (including this one) — it can only
// be handed to crypto.subtle.sign() while running on this origin. That also
// means it cannot be backed up or copied: a lost browser profile means the
// admin enrolls again on that device.

const DB_NAME = 'ssc-admin';
const DB_VERSION = 1;
const STORE = 'keys';
const RECORD_ID = 'signing-key';

// Must match SCHEME in app/admin_auth.py.
const SCHEME = 'SSC-ED25519-V1';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function runTx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function toBase64(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(bytes) {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)));
}

function randomNonce() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

// Ed25519 SPKI is a fixed 12-byte header followed by the 32-byte key.
async function exportRawPublicKey(publicKey) {
  try {
    return new Uint8Array(await crypto.subtle.exportKey('raw', publicKey));
  } catch (e) {
    const spki = new Uint8Array(await crypto.subtle.exportKey('spki', publicKey));
    return spki.slice(spki.length - 32);
  }
}

export function supportsEd25519() {
  return Boolean(window.isSecureContext && window.crypto && crypto.subtle && window.indexedDB);
}

export async function loadSigningKey() {
  const db = await openDb();
  try {
    return (await runTx(db, 'readonly', (store) => store.get(RECORD_ID))) || null;
  } finally {
    db.close();
  }
}

export async function createSigningKey(label) {
  let pair;
  try {
    pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify']);
  } catch (e) {
    throw new Error(
      'This browser cannot generate Ed25519 keys. Use Chrome 137+, Safari 17+ or Firefox 130+ over HTTPS.'
    );
  }

  const raw = await exportRawPublicKey(pair.publicKey);
  const record = {
    id: RECORD_ID,
    keyId: (await sha256Hex(raw)).slice(0, 16), // must match key_id_for() on the server
    publicKeyB64: toBase64(raw),
    privateKey: pair.privateKey,
    label: label || '',
    createdAt: new Date().toISOString(),
  };

  const db = await openDb();
  try {
    await runTx(db, 'readwrite', (store) => store.put(record));
  } finally {
    db.close();
  }
  return record;
}

export async function deleteSigningKey() {
  const db = await openDb();
  try {
    await runTx(db, 'readwrite', (store) => store.delete(RECORD_ID));
  } finally {
    db.close();
  }
}

// POST `payload` to `path`, signed with this device's key.
export async function signedPost(path, payload) {
  const record = await loadSigningKey();
  if (!record) {
    throw new Error('No admin key on this device. Enroll at /admin/enroll first.');
  }

  const body = JSON.stringify(payload);
  const bodyHash = await sha256Hex(new TextEncoder().encode(body));
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomNonce();

  const canonical = [SCHEME, 'POST', path, record.keyId, timestamp, nonce, bodyHash].join('\n');
  const signature = await crypto.subtle.sign(
    { name: 'Ed25519' },
    record.privateKey,
    new TextEncoder().encode(canonical)
  );

  return fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SSC-Key-Id': record.keyId,
      'X-SSC-Timestamp': timestamp,
      'X-SSC-Nonce': nonce,
      'X-SSC-Signature': toBase64(new Uint8Array(signature)),
    },
    // The signature covers these exact bytes, so send the string we hashed.
    body,
  });
}

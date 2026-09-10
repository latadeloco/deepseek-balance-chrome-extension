const encoder = new TextEncoder();
const decoder = new TextDecoder();

const subtle = globalThis.crypto.subtle;
const IV_BYTES = 12;
const KEY_BYTES = 32;

const VAULT_VERSION = 1;

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  if (typeof btoa === "function") return btoa(binary);
  return Buffer.from(bytes).toString("base64");
}

export function base64ToBytes(base64) {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

async function encryptWithKey(key, plaintext) {
  const iv = randomBytes(IV_BYTES);
  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptWithKey(key, vault) {
  const iv = base64ToBytes(vault.iv);
  const ciphertext = base64ToBytes(vault.ciphertext);
  const plaintext = await subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return decoder.decode(plaintext);
}

async function importRawKey(rawKey) {
  return subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function createAutoVault(token) {
  const rawKey = randomBytes(KEY_BYTES);
  const key = await importRawKey(rawKey);
  const { iv, ciphertext } = await encryptWithKey(key, token);
  return {
    key: bytesToBase64(rawKey),
    vault: { version: VAULT_VERSION, iv, ciphertext },
  };
}

export async function unlockAutoVault(vault, keyBase64) {
  const key = await importRawKey(base64ToBytes(keyBase64));
  return decryptWithKey(key, vault);
}

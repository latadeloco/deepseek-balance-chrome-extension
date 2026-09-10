const encoder = new TextEncoder();
const decoder = new TextDecoder();

const subtle = globalThis.crypto.subtle;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BYTES = 32;

export const PBKDF2_ITERATIONS = 310000;
export const VAULT_VERSION = 1;
export const MIN_PASSPHRASE_LENGTH = 8;
export const MODES = Object.freeze({ AUTO: "auto", PASSPHRASE: "passphrase" });

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

export async function deriveKeyFromPassphrase(passphrase, salt, iterations) {
  const baseKey = await subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(salt),
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function createAutoVault(token) {
  const rawKey = randomBytes(KEY_BYTES);
  const key = await importRawKey(rawKey);
  const { iv, ciphertext } = await encryptWithKey(key, token);
  return {
    key: bytesToBase64(rawKey),
    vault: { version: VAULT_VERSION, mode: MODES.AUTO, iv, ciphertext },
  };
}

export async function createPassphraseVault(token, passphrase) {
  const salt = bytesToBase64(randomBytes(SALT_BYTES));
  const iterations = PBKDF2_ITERATIONS;
  const key = await deriveKeyFromPassphrase(passphrase, salt, iterations);
  const { iv, ciphertext } = await encryptWithKey(key, token);
  return {
    version: VAULT_VERSION,
    mode: MODES.PASSPHRASE,
    salt,
    iterations,
    iv,
    ciphertext,
  };
}

export async function unlockAutoVault(vault, keyBase64) {
  const key = await importRawKey(base64ToBytes(keyBase64));
  return decryptWithKey(key, vault);
}

export async function unlockPassphraseVault(vault, passphrase) {
  const key = await deriveKeyFromPassphrase(
    passphrase,
    vault.salt,
    vault.iterations,
  );
  return decryptWithKey(key, vault);
}

import { describe, expect, it } from "vitest";

import {
  MIN_PASSPHRASE_LENGTH,
  MODES,
  base64ToBytes,
  bytesToBase64,
  createAutoVault,
  createPassphraseVault,
  unlockAutoVault,
  unlockPassphraseVault,
} from "../src/crypto.js";

const TOKEN = "sk-test-1234567890";

describe("base64 helpers", () => {
  it("round-trips arbitrary bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255]);
    expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes]);
  });
});

describe("auto vault", () => {
  it("encrypts and decrypts the token", async () => {
    const { key, vault } = await createAutoVault(TOKEN);
    expect(vault.mode).toBe(MODES.AUTO);
    expect(vault.ciphertext).not.toContain(TOKEN);
    await expect(unlockAutoVault(vault, key)).resolves.toBe(TOKEN);
  });

  it("fails with a different key", async () => {
    const { vault } = await createAutoVault(TOKEN);
    const other = await createAutoVault("other-token");
    await expect(unlockAutoVault(vault, other.key)).rejects.toThrow();
  });
});

describe("passphrase vault", () => {
  it("encrypts and decrypts with the right passphrase", async () => {
    const vault = await createPassphraseVault(TOKEN, "correct horse");
    expect(vault.mode).toBe(MODES.PASSPHRASE);
    expect(vault.salt).toBeTruthy();
    await expect(unlockPassphraseVault(vault, "correct horse")).resolves.toBe(
      TOKEN,
    );
  });

  it("rejects a wrong passphrase", async () => {
    const vault = await createPassphraseVault(TOKEN, "correct horse");
    await expect(unlockPassphraseVault(vault, "wrong horse")).rejects.toThrow();
  });

  it("exposes a minimum passphrase length", () => {
    expect(MIN_PASSPHRASE_LENGTH).toBe(8);
  });
});

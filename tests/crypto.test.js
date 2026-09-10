import { describe, expect, it } from "vitest";

import {
  base64ToBytes,
  bytesToBase64,
  createAutoVault,
  unlockAutoVault,
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
    expect(vault.version).toBe(1);
    expect(vault.ciphertext).not.toContain(TOKEN);
    await expect(unlockAutoVault(vault, key)).resolves.toBe(TOKEN);
  });

  it("fails with a different key", async () => {
    const { vault } = await createAutoVault(TOKEN);
    const other = await createAutoVault("other-token");
    await expect(unlockAutoVault(vault, other.key)).rejects.toThrow();
  });

  it("produces a different key and ciphertext on each call", async () => {
    const first = await createAutoVault(TOKEN);
    const second = await createAutoVault(TOKEN);
    expect(first.key).not.toBe(second.key);
    expect(first.vault.ciphertext).not.toBe(second.vault.ciphertext);
  });
});

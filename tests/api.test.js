import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchBalance, parseBalance } from "../src/api.js";

const SAMPLE = {
  is_available: true,
  balance_infos: [
    {
      currency: "CNY",
      total_balance: "110.00",
      granted_balance: "10.00",
      topped_up_balance: "100.00",
    },
    {
      currency: "USD",
      total_balance: "34.64",
      granted_balance: "0.00",
      topped_up_balance: "34.64",
    },
  ],
};

describe("parseBalance", () => {
  it("prefers the USD entry", () => {
    expect(parseBalance(SAMPLE)).toMatchObject({
      currency: "USD",
      totalBalance: "34.64",
      isAvailable: true,
    });
  });

  it("falls back to the first entry when USD is missing", () => {
    const data = {
      is_available: false,
      balance_infos: [{ currency: "CNY", total_balance: "5.00" }],
    };
    expect(parseBalance(data)).toMatchObject({
      currency: "CNY",
      totalBalance: "5.00",
      isAvailable: false,
    });
  });

  it("handles empty payloads", () => {
    expect(parseBalance({})).toEqual({
      isAvailable: false,
      currency: null,
      totalBalance: null,
      grantedBalance: null,
      toppedUpBalance: null,
    });
  });
});

describe("fetchBalance", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed data on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => SAMPLE,
      }),
    );
    await expect(fetchBalance("sk-x")).resolves.toMatchObject({
      currency: "USD",
      totalBalance: "34.64",
    });
  });

  it("throws an unauthorized error on 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    await expect(fetchBalance("sk-x")).rejects.toMatchObject({
      code: "unauthorized",
    });
  });

  it("throws a network error when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("network down")),
    );
    await expect(fetchBalance("sk-x")).rejects.toMatchObject({
      code: "network",
    });
  });

  it("sends the bearer token and hits the balance endpoint", async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => SAMPLE,
    });
    vi.stubGlobal("fetch", spy);
    await fetchBalance("sk-secret");
    expect(spy).toHaveBeenCalledWith(
      "https://api.deepseek.com/user/balance",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk-secret",
        }),
      }),
    );
  });
});

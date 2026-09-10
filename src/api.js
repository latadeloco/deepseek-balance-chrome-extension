export const BALANCE_URL = "https://api.deepseek.com/user/balance";
export const DEFAULT_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function parseBalance(data) {
  const infos = Array.isArray(data?.balance_infos) ? data.balance_infos : [];
  const info =
    infos.find((item) => item.currency === "USD") ?? infos[0] ?? null;
  return {
    isAvailable: Boolean(data?.is_available),
    currency: info?.currency ?? null,
    totalBalance: info?.total_balance ?? null,
    grantedBalance: info?.granted_balance ?? null,
    toppedUpBalance: info?.topped_up_balance ?? null,
  };
}

export async function fetchBalance(token, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(BALANCE_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("timeout", "Request timed out");
    }
    throw new ApiError("network", "Network request failed");
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ApiError("unauthorized", "Invalid or unauthorized token");
  }
  if (!response.ok) {
    throw new ApiError("http", `Unexpected response status ${response.status}`);
  }

  const data = await response.json();
  return parseBalance(data);
}

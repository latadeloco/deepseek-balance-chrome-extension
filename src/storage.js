export const KEYS = Object.freeze({
  VAULT: "ds_vault",
  AUTO_KEY: "ds_auto_key",
});

export async function getLocal(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

export async function setLocal(values) {
  await chrome.storage.local.set(values);
}

export async function clearAll() {
  await chrome.storage.local.remove([KEYS.VAULT, KEYS.AUTO_KEY]);
}

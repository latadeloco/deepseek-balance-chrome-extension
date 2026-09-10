export const KEYS = Object.freeze({
  VAULT: "ds_vault",
  AUTO_KEY: "ds_auto_key",
  SESSION_TOKEN: "ds_session_token",
});

export async function getLocal(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

export async function setLocal(values) {
  await chrome.storage.local.set(values);
}

export async function removeLocal(keys) {
  await chrome.storage.local.remove(keys);
}

export async function getSession(key) {
  const result = await chrome.storage.session.get(key);
  return result[key];
}

export async function setSession(values) {
  await chrome.storage.session.set(values);
}

export async function removeSession(keys) {
  await chrome.storage.session.remove(keys);
}

export async function clearAll() {
  await chrome.storage.local.remove([KEYS.VAULT, KEYS.AUTO_KEY]);
  await chrome.storage.session.remove([KEYS.SESSION_TOKEN]);
}

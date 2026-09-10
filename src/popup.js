import { fetchBalance } from "./api.js";
import {
  MIN_PASSPHRASE_LENGTH,
  MODES,
  createAutoVault,
  createPassphraseVault,
  unlockAutoVault,
  unlockPassphraseVault,
} from "./crypto.js";
import {
  KEYS,
  clearAll,
  getLocal,
  getSession,
  removeLocal,
  removeSession,
  setLocal,
  setSession,
} from "./storage.js";

const views = ["loading", "setup", "unlock", "balance", "error"].reduce(
  (acc, name) => {
    acc[name] = document.getElementById(`view-${name}`);
    return acc;
  },
  {},
);

const el = {
  token: document.getElementById("input-token"),
  secure: document.getElementById("input-secure"),
  secureFields: document.getElementById("secure-fields"),
  passphrase: document.getElementById("input-passphrase"),
  remember: document.getElementById("input-remember"),
  setupError: document.getElementById("setup-error"),
  save: document.getElementById("btn-save"),
  formSetup: document.getElementById("form-setup"),
  unlockPassphrase: document.getElementById("input-unlock-passphrase"),
  unlockRemember: document.getElementById("input-unlock-remember"),
  unlockError: document.getElementById("unlock-error"),
  unlock: document.getElementById("btn-unlock"),
  reset: document.getElementById("btn-reset"),
  formUnlock: document.getElementById("form-unlock"),
  value: document.getElementById("balance-value"),
  currency: document.getElementById("balance-currency"),
  status: document.getElementById("balance-status"),
  refresh: document.getElementById("btn-refresh"),
  disconnect: document.getElementById("btn-disconnect"),
  errorMessage: document.getElementById("error-message"),
  retry: document.getElementById("btn-retry"),
};

let activeToken = null;

function msg(key) {
  return chrome.i18n.getMessage(key) || key;
}

function localize() {
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = msg(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
    node.placeholder = msg(node.dataset.i18nPlaceholder);
  }
  for (const node of document.querySelectorAll("[data-i18n-aria]")) {
    node.setAttribute("aria-label", msg(node.dataset.i18nAria));
  }
}

function show(name) {
  for (const [key, node] of Object.entries(views)) {
    node.classList.toggle("is-active", key === name);
  }
}

function showElement(node, visible) {
  node.hidden = !visible;
}

function setBusy(button, busy) {
  button.disabled = busy;
}

function errorMessage(error) {
  switch (error?.code) {
    case "unauthorized":
      return msg("errorInvalidToken");
    case "network":
      return msg("errorNetwork");
    case "timeout":
      return msg("errorTimeout");
    default:
      return msg("errorUnknown");
  }
}

function renderBalance(data) {
  el.value.textContent = data.totalBalance ?? "--";
  el.currency.textContent = data.currency ?? "";
  if (!data.isAvailable) {
    el.status.textContent = msg("statusUnavailable");
    el.status.classList.add("is-unavailable");
  } else {
    el.status.textContent = "";
    el.status.classList.remove("is-unavailable");
  }
}

async function loadBalance(token) {
  show("loading");
  try {
    const data = await fetchBalance(token);
    activeToken = token;
    renderBalance(data);
    show("balance");
  } catch (error) {
    el.errorMessage.textContent = errorMessage(error);
    show("error");
  }
}

async function persistVault(token, secure, passphrase, remember) {
  if (secure) {
    const vault = await createPassphraseVault(token, passphrase);
    await setLocal({ [KEYS.VAULT]: vault });
    await removeLocal(KEYS.AUTO_KEY);
    if (remember) {
      await setSession({ [KEYS.SESSION_TOKEN]: token });
    } else {
      await removeSession(KEYS.SESSION_TOKEN);
    }
    return;
  }
  const { key, vault } = await createAutoVault(token);
  await setLocal({ [KEYS.VAULT]: vault, [KEYS.AUTO_KEY]: key });
  await removeSession(KEYS.SESSION_TOKEN);
}

async function handleSetup(event) {
  event.preventDefault();
  showElement(el.setupError, false);

  const token = el.token.value.trim();
  const secure = el.secure.checked;
  const passphrase = el.passphrase.value;

  if (!token) {
    el.setupError.textContent = msg("errorTokenRequired");
    showElement(el.setupError, true);
    return;
  }
  if (secure && passphrase.length < MIN_PASSPHRASE_LENGTH) {
    el.setupError.textContent = msg("errorPassphraseShort");
    showElement(el.setupError, true);
    return;
  }

  setBusy(el.save, true);
  show("loading");
  try {
    const data = await fetchBalance(token);
    await persistVault(token, secure, passphrase, el.remember.checked);
    activeToken = token;
    renderBalance(data);
    show("balance");
  } catch (error) {
    show("setup");
    el.setupError.textContent = errorMessage(error);
    showElement(el.setupError, true);
  } finally {
    setBusy(el.save, false);
  }
}

async function handleUnlock(event) {
  event.preventDefault();
  showElement(el.unlockError, false);

  const vault = await getLocal(KEYS.VAULT);
  const passphrase = el.unlockPassphrase.value;

  setBusy(el.unlock, true);
  show("loading");
  let token;
  try {
    token = await unlockPassphraseVault(vault, passphrase);
  } catch {
    show("unlock");
    setBusy(el.unlock, false);
    el.unlockError.textContent = msg("errorWrongPassphrase");
    showElement(el.unlockError, true);
    return;
  }

  if (el.unlockRemember.checked) {
    await setSession({ [KEYS.SESSION_TOKEN]: token });
  } else {
    await removeSession(KEYS.SESSION_TOKEN);
  }
  await loadBalance(token);
  setBusy(el.unlock, false);
}

async function handleDisconnect() {
  await clearAll();
  activeToken = null;
  el.token.value = "";
  el.passphrase.value = "";
  el.secure.checked = false;
  el.remember.checked = false;
  el.unlockPassphrase.value = "";
  el.unlockRemember.checked = false;
  showElement(el.secureFields, false);
  showElement(el.setupError, false);
  showElement(el.unlockError, false);
  show("setup");
}

async function handleRefresh() {
  if (activeToken) {
    await loadBalance(activeToken);
  } else {
    await init();
  }
}

function handleSecureToggle() {
  showElement(el.secureFields, el.secure.checked);
}

async function init() {
  localize();
  const vault = await getLocal(KEYS.VAULT);

  if (!vault) {
    show("setup");
    return;
  }

  if (vault.mode === MODES.AUTO) {
    const key = await getLocal(KEYS.AUTO_KEY);
    if (!key) {
      show("setup");
      return;
    }
    try {
      const token = await unlockAutoVault(vault, key);
      await loadBalance(token);
    } catch {
      await clearAll();
      show("setup");
    }
    return;
  }

  const sessionToken = await getSession(KEYS.SESSION_TOKEN);
  if (sessionToken) {
    await loadBalance(sessionToken);
    return;
  }
  show("unlock");
}

el.formSetup.addEventListener("submit", handleSetup);
el.formUnlock.addEventListener("submit", handleUnlock);
el.secure.addEventListener("change", handleSecureToggle);
el.refresh.addEventListener("click", handleRefresh);
el.disconnect.addEventListener("click", handleDisconnect);
el.reset.addEventListener("click", handleDisconnect);
el.retry.addEventListener("click", handleRefresh);

init();

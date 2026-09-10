import { fetchBalance } from "./api.js";
import { createAutoVault, unlockAutoVault } from "./crypto.js";
import { KEYS, clearAll, getLocal, setLocal } from "./storage.js";

const views = ["loading", "setup", "balance", "error"].reduce((acc, name) => {
  acc[name] = document.getElementById(`view-${name}`);
  return acc;
}, {});

const el = {
  token: document.getElementById("input-token"),
  setupError: document.getElementById("setup-error"),
  save: document.getElementById("btn-save"),
  formSetup: document.getElementById("form-setup"),
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

async function handleSetup(event) {
  event.preventDefault();
  showElement(el.setupError, false);

  const token = el.token.value.trim();
  if (!token) {
    el.setupError.textContent = msg("errorTokenRequired");
    showElement(el.setupError, true);
    return;
  }

  el.save.disabled = true;
  show("loading");
  try {
    const data = await fetchBalance(token);
    const { key, vault } = await createAutoVault(token);
    await setLocal({ [KEYS.VAULT]: vault, [KEYS.AUTO_KEY]: key });
    activeToken = token;
    renderBalance(data);
    show("balance");
  } catch (error) {
    show("setup");
    el.setupError.textContent = errorMessage(error);
    showElement(el.setupError, true);
  } finally {
    el.save.disabled = false;
  }
}

async function handleDisconnect() {
  await clearAll();
  activeToken = null;
  el.token.value = "";
  showElement(el.setupError, false);
  show("setup");
}

async function handleRefresh() {
  if (activeToken) {
    await loadBalance(activeToken);
  } else {
    await init();
  }
}

async function init() {
  localize();
  const vault = await getLocal(KEYS.VAULT);
  const key = await getLocal(KEYS.AUTO_KEY);

  if (!vault || !key) {
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
}

el.formSetup.addEventListener("submit", handleSetup);
el.refresh.addEventListener("click", handleRefresh);
el.disconnect.addEventListener("click", handleDisconnect);
el.retry.addEventListener("click", handleRefresh);

init();

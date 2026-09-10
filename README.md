# DeepSeek Balance

> **Unofficial extension.** This project is not affiliated with, associated with, or endorsed by DeepSeek.

A tiny Chrome extension (Manifest V3) to check your **available DeepSeek balance** at a glance, without opening the website or digging through menus. It is **free**, **open source**, and **lightweight**: no runtime dependencies, no trackers, and all the code is yours to audit, modify, and share.

## Why?

If you use the DeepSeek API, finding out how much credit you have left usually means logging into the platform and looking for it. This extension shows it in one click from the Chrome toolbar: open the popup and see your balance instantly.

## What it does

- Shows the **total balance** (`total_balance`) together with its currency, for example `34.64 USD`.
- Automatically selects the **USD** entry; if it is missing, it shows the first available currency.
- Authenticates with your DeepSeek **API token** (`Bearer` header).
- **Encrypts the token** before storing it (AES-256-GCM) and keeps it on your device: you will not have to enter it again after closing Chrome.
- Refreshes the balance **when the popup opens**; includes **refresh** and **disconnect** buttons.
- UI in **English and Spanish** (based on the browser language).
- Automatic **light/dark theme** following the system.
- Warning when the balance is insufficient for API calls.

## Privacy

The extension **does not send your data to any server of ours**: there is no analytics, telemetry, or backend. The only connection it makes is to the official DeepSeek API (`https://api.deepseek.com`), using your token. Your token is stored **only on your device**, encrypted.

## Installation

The extension is not published on the Chrome Web Store, so it is installed in **developer mode**:

1. Clone or download this repository:

   ```bash
   git clone git@github.com:latadeloco/deepseek-balance-chrome-extension.git
   ```

2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. (Optional) Pin the extension to the toolbar.

## Usage

1. Get an API token at [platform.deepseek.com](https://platform.deepseek.com/).
2. Click the extension icon, enter the token, and click **Save**.
3. The extension validates the token against the official endpoint and shows your balance.
4. From then on, every time you open the popup you will see your balance without entering anything again. The token is kept **across Chrome restarts** until you click **Disconnect**.

## Security

- The token is stored encrypted with **AES-256-GCM**. The key is randomly generated on your device and stored locally, since a Chrome extension cannot access the operating system keychain. This prevents the token from being left **in plain text** in the Chrome profile storage.
- The extension connects **only** to `https://api.deepseek.com` over HTTPS, sending your token in the `Authorization` header.
- Minimal permissions: only `storage` (to save your data locally) and network access limited to `https://api.deepseek.com/*`.
- Click **Disconnect** to erase the stored token from your device.

> **Honest limits.** The encryption is local and is meant to keep your token from being stored in the clear. No local scheme protects the token against a compromised machine (malware, keylogger) or against someone with access to your Chrome session opening the extension.

## Development

Requires Node.js LTS.

```bash
npm install
npm run lint     # ESLint
npm run test     # Vitest
npm run format   # Prettier
```

Structure:

```
manifest.json        MV3 configuration
popup.html           Popup UI
src/popup.js         UI logic
src/crypto.js        Encryption (AES-GCM)
src/api.js           Balance endpoint call
src/storage.js       chrome.storage wrapper
_locales/            Translations (en, es)
styles/popup.css     Light/dark theme styles
tests/               Unit tests
```

The endpoint used is `GET https://api.deepseek.com/user/balance` with the header `Authorization: Bearer <token>`.

## Contributing

Pull requests, issues, and ideas are welcome. If you find a bug or have an improvement in mind, open an issue in the repository.

## License

MIT © Jesús Robles Sánchez. Free to use: you may use, copy, modify, and distribute the project under the terms of the license.

---

## Español (breve)

Extensión no oficial de Chrome (MV3) para ver de un vistazo tu saldo disponible en DeepSeek. Introduce tu token de API una sola vez; se guarda cifrado (AES-256-GCM) en tu equipo y se mantiene entre reinicios de Chrome hasta que pulses **Desconectar**. Solo se conecta a la API oficial de DeepSeek. Interfaz en español e inglés y tema claro/oscuro automático. Sin afiliación con DeepSeek. Licencia MIT.

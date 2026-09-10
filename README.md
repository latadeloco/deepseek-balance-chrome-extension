# DeepSeek Balance

> **Extensión no oficial.** Este proyecto no está afiliado, asociado ni respaldado por DeepSeek.

Extensión de Chrome (Manifest V3) para ver de un vistazo tu **saldo disponible en DeepSeek**. Es ligera, sin dependencias en tiempo de ejecución y con interfaz en español e inglés (según el idioma del navegador) y tema claro/oscuro automático.

## Funciones

- Panel minimalista con el saldo (`total_balance`) y la divisa, p. ej. `34.64 USD`.
- Selecciona automáticamente la entrada en **USD**; si no existe, muestra la primera divisa disponible.
- Desbloqueo mediante tu **token de API** de DeepSeek (`Bearer`).
- **Cifrado** del token antes de guardarlo (AES-256-GCM).
- Refresh al abrir el popup, botón de actualizar y botón de desconectar.
- Interfaz i18n (`es`/`en`) y temas claro/oscuro automáticos.

## Instalación (modo desarrollador)

1. Clona o descarga este repositorio.
2. Abre `chrome://extensions` en Chrome.
3. Activa **Modo de desarrollador** (arriba a la derecha).
4. Pulsa **Cargar descomprimida** y selecciona la carpeta del proyecto.
5. Fija la extensión en la barra si lo deseas.

## Uso

1. Consigue un token de API en [platform.deepseek.com](https://platform.deepseek.com/).
2. Abre la extensión, introduce el token y pulsa **Guardar**.
3. La extensión valida el token contra el endpoint oficial y muestra tu saldo.

### Modos de seguridad

| Modo                       | Cómo funciona                                                                                               | Protección                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Estándar** (por defecto) | Se genera una clave aleatoria y se guarda localmente junto al token cifrado. No pide nada al usuario.       | **Ofuscación**, no cifrado real: quien acceda al perfil de Chrome obtiene clave y token. |
| **Modo seguro** (opcional) | Deriva la clave de una **frase de paso** tuya (PBKDF2-SHA256, 310.000 iteraciones) que **nunca se guarda**. | **Cifrado real**: sin la frase de paso, el token no puede descifrarse.                   |

En **modo seguro** puedes marcar _Recordar hasta cerrar Chrome_: la frase/token se guarda en `chrome.storage.session` (memoria RAM) y se borra al cerrar el navegador.

> Aviso: ningún esquema local protege el token si el equipo está comprometido (malware, keylogger) o mientras la extensión está desbloqueada. La opción _Recordar hasta cerrar Chrome_ mantiene el token en memoria hasta cerrar Chrome.

Si olvidas la frase de paso, el token cifrado no se puede recuperar: usa **Desconectar / Introduce un token nuevo** para empezar de cero.

## Desarrollo

Requiere Node.js LTS.

```bash
npm install
npm run lint     # ESLint
npm run test     # Vitest
npm run format   # Prettier
```

Estructura:

```
manifest.json        Configuración MV3
popup.html           Interfaz del popup
src/popup.js         Máquina de estados de la UI
src/crypto.js        Cifrado (PBKDF2 + AES-GCM)
src/api.js           Llamada al endpoint de saldo
src/storage.js       Wrapper de chrome.storage
_locales/            Traducciones (en, es)
styles/popup.css     Estilos con tema claro/oscuro
tests/               Pruebas unitarias
```

El endpoint usado es `GET https://api.deepseek.com/user/balance` con cabecera `Authorization: Bearer <token>`.

## Licencia

MIT © Jesús Robles Sánchez.

---

## English (short)

Unofficial Chrome extension (MV3) to display your available DeepSeek balance. Enter your DeepSeek API token; the token is encrypted before being stored (auto key by default, or a passphrase in Secure mode). UI in English/Spanish and automatic light/dark theme. Not affiliated with DeepSeek. Licensed under MIT.

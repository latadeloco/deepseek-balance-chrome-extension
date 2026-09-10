# DeepSeek Balance

> **Extensión no oficial.** Este proyecto no está afiliado, asociado ni respaldado por DeepSeek.

Una pequeña extensión de Chrome (Manifest V3) para consultar de un vistazo tu **saldo disponible en DeepSeek**, sin abrir la web ni navegar por menús. Es **gratuita**, **open source** y **ligera**: no incluye dependencias en tiempo de ejecución ni rastreadores, y todo el código es tuyo para auditar, modificar y compartir.

## ¿Por qué?

Si usas la API de DeepSeek, saber cuánto saldo te queda suele implicar entrar en la plataforma y buscarlo. Esta extensión te lo muestra en un clic desde la barra de Chrome: abres el popup y ves el saldo al instante.

## ¿Qué hace?

- Muestra el **saldo total** (`total_balance`) junto con su divisa, por ejemplo `34.64 USD`.
- Selecciona automáticamente la entrada en **USD**; si no existe, muestra la primera divisa disponible.
- Se autentica con tu **token de API** de DeepSeek (cabecera `Bearer`).
- **Cifra el token** antes de guardarlo (AES-256-GCM) y lo conserva en tu equipo: no tendrás que volver a escribirlo al cerrar Chrome.
- Actualiza el saldo **al abrir el popup**; incluye botones de **actualizar** y **desconectar**.
- Interfaz en **español e inglés** (según el idioma del navegador).
- **Tema claro/oscuro** automático según el sistema.
- Aviso si el saldo es insuficiente para llamadas a la API.

## Privacidad

La extensión **no envía tus datos a ningún servidor propio**: no hay analíticas, ni telemetría, ni backend. La única conexión que realiza es a la API oficial de DeepSeek (`https://api.deepseek.com`), usando tu token. Tu token se guarda **solo en tu equipo**, cifrado.

## Instalación

La extensión no está publicada en la Chrome Web Store, por lo que se instala en **modo desarrollador**:

1. Clona o descarga este repositorio:

   ```bash
   git clone git@github.com:latadeloco/deepseek-balance-chrome-extension.git
   ```

2. Abre `chrome://extensions` en Chrome.
3. Activa **Modo de desarrollador** (arriba a la derecha).
4. Pulsa **Cargar descomprimida** y selecciona la carpeta del proyecto.
5. (Opcional) Fija la extensión en la barra de herramientas.

## Uso

1. Consigue un token de API en [platform.deepseek.com](https://platform.deepseek.com/).
2. Pulsa el icono de la extensión, introduce el token y pulsa **Guardar**.
3. La extensión valida el token contra el endpoint oficial y muestra tu saldo.
4. A partir de ahí, cada vez que abras el popup verás tu saldo sin volver a introducir nada. El token se conserva **entre reinicios de Chrome** hasta que pulses **Desconectar**.

## Seguridad

- El token se guarda cifrado con **AES-256-GCM**. La clave se genera aleatoriamente en tu equipo y se guarda localmente, ya que una extensión de Chrome no puede acceder al llavero del sistema operativo. Esto protege el token de que quede **en texto plano** en el almacenamiento del perfil.
- La extensión se conecta **únicamente** a `https://api.deepseek.com` mediante HTTPS, con tu token en la cabecera `Authorization`.
- Permisos mínimos: solo `storage` (guardar tus datos localmente) y acceso de red exclusivamente a `https://api.deepseek.com/*`.
- Pulsa **Desconectar** para borrar el token guardado de tu equipo.

> **Límites honestos.** El cifrado es local y está pensado para que tu token no se almacene en claro. Ningún esquema local protege el token frente a un equipo comprometido (malware, keylogger) o si alguien con acceso a tu sesión de Chrome abre la extensión.

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
src/popup.js         Lógica de la UI
src/crypto.js        Cifrado (AES-GCM)
src/api.js           Llamada al endpoint de saldo
src/storage.js       Wrapper de chrome.storage
_locales/            Traducciones (en, es)
styles/popup.css     Estilos con tema claro/oscuro
tests/               Pruebas unitarias
```

El endpoint usado es `GET https://api.deepseek.com/user/balance` con cabecera `Authorization: Bearer <token>`.

## Contribuir

Las pull requests, issues e ideas son bienvenidas. Si encuentras un bug o propones una mejora, abre un issue en el repositorio.

## Licencia

MIT © Jesús Robles Sánchez. Uso libre y gratuito: puedes usar, copiar, modificar y distribuir el proyecto respetando los términos de la licencia.

---

## English (short)

A tiny, free, open-source Chrome extension (MV3) to check your available DeepSeek balance at a glance. Enter your DeepSeek API token once; it is stored encrypted (AES-256-GCM) on your device and stays across Chrome restarts until you disconnect. It only talks to the official DeepSeek API. UI in English/Spanish with automatic light/dark theme. Not affiliated with DeepSeek. Licensed under MIT.

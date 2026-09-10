# DeepSeek Balance

> **Extensión no oficial.** Este proyecto no está afiliado, asociado ni respaldado por DeepSeek.

Una pequeña extensión de Chrome (Manifest V3) para consultar de un vistazo tu **saldo disponible en DeepSeek**, sin abrir la web ni navegar por menús. Es **gratuita**, **open source** y **ligera**: no incluye dependencias en tiempo de ejecución ni rastreadores, y todo el código es tuyo para auditar, modificar y compartir.

## ¿Por qué?

Si usas la API de DeepSeek, saber cuánto saldo te queda suele implicar entrar en la plataforma y buscarlo. Esta extensión te lo muestra en un clic desde la barra de Chrome: abres el popup y ves el saldo al instante.

## ¿Qué hace?

- Muestra el **saldo total** (`total_balance`) junto con su divisa, por ejemplo `34.64 USD`.
- Selecciona automáticamente la entrada en **USD**; si no existe, muestra la primera divisa disponible.
- Se autentica con tu **token de API** de DeepSeek (cabecera `Bearer`).
- **Cifra el token** antes de guardarlo (AES-256-GCM).
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

## Seguridad

Esta sección es importante y quiero ser transparente: el nivel de protección depende del modo que elijas.

El token se guarda cifrado con **AES-256-GCM**. La diferencia entre modos está en **de dónde sale la clave** de cifrado, porque una extensión de Chrome no puede acceder al llavero del sistema operativo.

| Modo                       | Cómo funciona                                                                                                           | Protección real                                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Estándar** (por defecto) | Se genera una clave aleatoria y se guarda localmente junto al token cifrado. No pide nada al usuario.                   | **Ofuscación**: quien acceda al perfil de Chrome obtiene la clave y el token, por lo que puede descifrarlo. |
| **Seguro** (opcional)      | La clave se deriva de una **frase de paso** tuya (PBKDF2-SHA256, 310.000 iteraciones) que **nunca se guarda** en disco. | **Cifrado real**: sin la frase de paso, el token no se puede descifrar.                                     |

Detalles adicionales:

- En **modo seguro** puedes marcar _Recordar hasta cerrar Chrome_: el token se guarda en `chrome.storage.session`, que vive en **memoria RAM** y se borra al cerrar el navegador.
- Si olvidas la frase de paso, el token cifrado **no se puede recuperar**. Usa **Desconectar** (o el enlace de reintroducir token) para empezar de cero.
- El token solo se envía a `api.deepseek.com` mediante HTTPS.
- Los permisos solicitados son mínimos: `storage` (guardar tus datos localmente) y acceso de red únicamente a `https://api.deepseek.com/*`.

> **Límites honestos.** Ningún esquema local puede protegerte si el equipo está comprometido (malware, keylogger) o mientras la extensión está desbloqueada en memoria. Si quieres la máxima protección, usa el **modo seguro** sin _Recordar hasta cerrar Chrome_.

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

## Contribuir

Las pull requests, issues e ideas son bienvenidas. Si encuentras un bug o propones una mejora, abre un issue en el repositorio.

## Licencia

MIT © Jesús Robles Sánchez. Uso libre y gratuito: puedes usar, copiar, modificar y distribuir el proyecto respetando los términos de la licencia.

---

## English (short)

A tiny, free, open-source Chrome extension (MV3) to check your available DeepSeek balance at a glance. It authenticates with your DeepSeek API token, stores it encrypted (AES-256-GCM), and only talks to the official DeepSeek API. Two security modes: a convenience mode with a locally stored key (obfuscation) and a passphrase-based secure mode (real encryption). UI in English/Spanish with automatic light/dark theme. Not affiliated with DeepSeek. Licensed under MIT.

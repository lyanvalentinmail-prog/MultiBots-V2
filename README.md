# MultiBots-V2

Plataforma multibot para WhatsApp basada en **Baileys**, con terminal interactiva pensada para **Termux**. Cada bot tiene sus propios comandos, recursos, librerías y sesión de WhatsApp.

## Requisitos

- Node.js 20 o superior.
- ffmpeg para crear stickers.
- Un número de WhatsApp para vincular.

## Instalación en Termux

Desde la carpeta del repositorio:

```bash
bash install-termux.sh
npm start
```

También puedes instalar manualmente:

```bash
pkg install nodejs-lts ffmpeg
npm install
npm start
```

> Concede a Termux permiso de almacenamiento solo si guardas el proyecto en almacenamiento compartido. No hace falta root.

## Vincular un bot

En la terminal escribe `start` y sigue el asistente, o usa directamente:

```text
start 1 qr
start 1 code
```

- **QR:** abre WhatsApp → **Dispositivos vinculados** → **Vincular un dispositivo** y escanea el código mostrado.
- **Código:** introduce el teléfono con código de país, sin `+`, espacios ni guiones (por ejemplo, `59899123456`). Después abre WhatsApp → **Dispositivos vinculados** → **Vincular con número de teléfono** e introduce el código.

La sesión se guarda en `Bots/<nombre>/.session/`. Estas credenciales están excluidas de Git y **no deben compartirse**. Para volver a vincular, detén el bot, borra esa carpeta y ejecuta `start` otra vez.

## Terminal personalizada

| Comando | Función |
| --- | --- |
| `bots` | Lista los bots disponibles |
| `start [bot] [qr\|code]` | Inicia un bot (abre el asistente si no hay argumentos) |
| `stop <bot>` | Detiene un bot |
| `restart <bot>` | Reinicia un bot |
| `status` | Muestra estado y tiempo activo |
| `clear` | Limpia la terminal |
| `help` | Muestra la ayuda |
| `exit` | Detiene todos los bots y sale |

El bot se puede indicar por número, nombre completo o identificador. Ejemplos: `start 1 qr`, `start "Universal bot" code`, `stop 1`.

## Universal bot

Prefijo predeterminado: `.`

**General:** `.menu`, `.comando`, `.ping`, `.info`, `.id`

**Multimedia y utilidades:** `.sticker`, `.toimg`, `.calc`, `.poll`

**Diversión:** `.dado`, `.moneda`, `.elegir`

**Grupos:** `.kick`, `.add`, `.promote`, `.demote`, `.group`, `.link`, `.revoke`, `.tagall`, `.setname`, `.setdesc`, `.groupinfo`, `.delete`, `.welcome`, `.antilink`

**Exclusivos del dueño:** `.mode`, `.setprefix`, `.broadcast`, `.join`, `.block`, `.unblock`, `.leave`

Escribe `.menu` para ver la lista organizada por categorías y `.comando <nombre>` para consultar alias y permisos. Los comandos de grupos validan automáticamente si hace falta ser administrador y si el bot necesita administración.

El número que vincula WhatsApp se reconoce como dueño automáticamente. Se pueden añadir números de confianza en el array `owners` de `bot.json`, usando código de país y solo números. En modo privado (`.mode private`) solo los dueños pueden ejecutar comandos.

Para `.sticker`, envía una imagen/video con `.sticker` como pie o responde al archivo con el comando. Alias: `.s`. Las bienvenidas, antienlaces, modo y prefijo se guardan localmente en `data/settings.json`, excluido de Git.

## Estructura

```text
Bots/
└── Universal bot/
    ├── bot.json          # Nombre, versión y prefijo
    ├── plugins/          # Un archivo por comando
    ├── assets/           # Imágenes, audios y otros recursos
    ├── lib/              # Cargador, handler y utilidades
    └── .session/         # Credenciales locales (generada automáticamente)
src/
├── index.js              # Terminal interactiva
├── manager.js            # Procesos de los bots
├── bots.js               # Descubrimiento automático
└── bot-runner.js         # Conexión Baileys y reconexión
```

Los bots se descubren automáticamente al abrir la plataforma: basta con crear otra carpeta dentro de `Bots/` con su `bot.json`, `plugins/`, `assets/` y `lib/`.

## Añadir un plugin

Crea `Bots/Universal bot/plugins/saludar.js`:

```js
export default {
  name: 'saludar',
  aliases: ['hola'],
  description: 'Envía un saludo',
  async execute({ reply, args }) {
    await reply(`¡Hola${args.length ? `, ${args.join(' ')}` : ''}! 👋`);
  }
};
```

Reinicia el bot para cargarlo. El menú se actualiza automáticamente. El prefijo se cambia en `bot.json`.

## Solución de problemas

- **QR o código inválido:** vuelve a iniciar el bot para generar uno nuevo; caducan rápidamente.
- **ffmpeg no encontrado:** ejecuta `pkg install ffmpeg` y reinicia.
- **Sesión cerrada:** borra `.session` del bot y vincula de nuevo.
- **No llegan comandos:** comprueba el prefijo, que WhatsApp figure como conectado y que el mensaje no sea de un canal o estado.

Este proyecto usa la librería no oficial Baileys. WhatsApp puede cambiar su protocolo; actualiza la dependencia si la conexión deja de funcionar.

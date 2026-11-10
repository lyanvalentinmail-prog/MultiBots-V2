import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFile, rm } from 'node:fs/promises';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

const botDirectory = path.resolve(process.argv[2] || '');
const config = JSON.parse(await readFile(path.join(botDirectory, 'bot.json'), 'utf8'));
const method = process.env.MULTIBOTS_AUTH_METHOD || 'qr';
const phone = (process.env.MULTIBOTS_PHONE || '').replace(/\D/g, '');
const logger = pino({ level: 'silent' });
const startedAt = Date.now();
let socket;
let stopping = false;
let reconnectTimer;
let pairingTimer;
let pairingRequested = false;
let registrationRecoveryAttempts = 0;
const authDirectory = path.join(botDirectory, '.session');

const { handleMessage, handleGroupUpdate, loadPlugins } = await import(
  pathToFileURL(path.join(botDirectory, 'lib', 'handler.js')).href
);
const { loadSettings } = await import(
  pathToFileURL(path.join(botDirectory, 'lib', 'settings.js')).href
);
const store = await loadSettings(botDirectory, config);
const plugins = await loadPlugins(botDirectory);
console.log(`[${config.name}] ${new Set(plugins.values()).size} comando(s) cargado(s).`);

async function connect() {
  clearTimeout(pairingTimer);
  const { state, saveCreds } = await useMultiFileAuthState(authDirectory);
  const { version } = await fetchLatestBaileysVersion();
  pairingRequested = false;

  socket = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true
  });

  // Baileys necesita que el socket termine de inicializar antes de solicitar
  // el código. Hacerlo en el primer evento "connecting" puede cerrar la conexión.
  if (method === 'code' && !state.creds.registered) {
    pairingTimer = setTimeout(async () => {
      if (stopping || pairingRequested) return;
      pairingRequested = true;
      try {
        const code = await socket.requestPairingCode(phone);
        console.log(`\n[${config.name}] CÓDIGO DE VINCULACIÓN: ${code.match(/.{1,4}/g)?.join('-') || code}`);
        console.log('En WhatsApp: Dispositivos vinculados > Vincular con número de teléfono.\n');
      } catch (error) {
        pairingRequested = false;
        console.error(`[${config.name}] No se pudo obtener el código: ${error.message}. Se reintentará la conexión.`);
      }
    }, 3000);
  }

  socket.ev.on('creds.update', saveCreds);
  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const message of messages) {
      await handleMessage({ socket, message, config, plugins, botDirectory, startedAt, store });
    }
  });
  socket.ev.on('group-participants.update', async (update) => {
    try { await handleGroupUpdate({ socket, update, store, config }); }
    catch (error) { console.error(`[${config.name}] Bienvenida: ${error.message}`); }
  });

  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr && method === 'qr') {
      console.log(`\n[${config.name}] Escanea este QR desde WhatsApp > Dispositivos vinculados:`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      registrationRecoveryAttempts = 0;
      console.log(`[${config.name}] ✓ WhatsApp conectado. Prefijo: ${config.prefix || '.'}`);
    }

    if (connection === 'close') {
      clearTimeout(pairingTimer);
      const status = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = status === DisconnectReason.loggedOut;
      if (loggedOut && !state.creds.registered && registrationRecoveryAttempts < 1) {
        registrationRecoveryAttempts++;
        console.log(`[${config.name}] Limpiando una vinculación incompleta y reintentando...`);
        await rm(authDirectory, { recursive: true, force: true });
        reconnectTimer = setTimeout(() => connect().catch(fatal), 2000);
        return;
      }
      if (loggedOut) {
        console.error(`[${config.name}] Sesión cerrada. Ejecuta nuevamente start ${method === 'code' ? '1 code' : '1 qr'}.`);
        process.exitCode = 1;
        stopping = true;
        return;
      }
      if (!stopping) {
        console.log(`[${config.name}] Conexión cerrada (${status || 'desconocida'}); reconectando...`);
        reconnectTimer = setTimeout(() => connect().catch(fatal), 3000);
      }
    }
  });
}

function fatal(error) {
  console.error(`[${config.name}] Error: ${error.stack || error.message}`);
  if (!stopping) {
    reconnectTimer = setTimeout(() => connect().catch(fatal), 5000);
  }
}

async function shutdown() {
  stopping = true;
  clearTimeout(reconnectTimer);
  clearTimeout(pairingTimer);
  try {
    socket?.end();
  } catch {}
  setTimeout(() => process.exit(0), 100).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (error) => console.error(`[${config.name}] ${error}`));
await connect();

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeJid } from './group.js';

const metadataCache = new Map();

export async function loadPlugins(botDirectory) {
  const directory = path.join(botDirectory, 'plugins');
  const files = (await readdir(directory)).filter((file) => file.endsWith('.js')).sort();
  const plugins = new Map();
  for (const file of files) {
    const module = await import(`${pathToFileURL(path.join(directory, file)).href}?v=${Date.now()}`);
    const plugin = module.default;
    if (!plugin?.name || typeof plugin.execute !== 'function') throw new Error(`Plugin inválido: ${file}`);
    plugins.set(plugin.name.toLowerCase(), plugin);
    for (const alias of plugin.aliases || []) plugins.set(alias.toLowerCase(), plugin);
  }
  return plugins;
}

function unwrap(message) {
  return message?.ephemeralMessage?.message || message?.viewOnceMessage?.message
    || message?.viewOnceMessageV2?.message || message;
}

export function messageText(message) {
  const content = unwrap(message?.message);
  return content?.conversation || content?.extendedTextMessage?.text
    || content?.imageMessage?.caption || content?.videoMessage?.caption || '';
}

async function groupData(socket, jid) {
  const cached = metadataCache.get(jid);
  if (cached && Date.now() - cached.time < 30_000) return cached.data;
  const data = await socket.groupMetadata(jid);
  metadataCache.set(jid, { data, time: Date.now() });
  return data;
}

function isAdmin(metadata, jid) {
  const normalized = normalizeJid(jid);
  return metadata?.participants?.some((person) =>
    (person.id === jid || normalizeJid(person.id) === normalized || normalizeJid(person.phoneNumber) === normalized)
    && ['admin', 'superadmin'].includes(person.admin));
}

export async function handleMessage(context) {
  const { socket, message, config, plugins, botDirectory, startedAt, store } = context;
  const jid = message.key.remoteJid;
  if (!jid || jid === 'status@broadcast' || jid.endsWith('@newsletter')) return;

  const text = messageText(message).trim();
  const isGroup = jid.endsWith('@g.us');
  const sender = message.key.participant || jid;
  const senderNumber = normalizeJid(sender).split('@')[0];
  const botNumber = normalizeJid(socket.user?.id).split('@')[0];
  const isOwner = Boolean(message.key.fromMe) || senderNumber === botNumber
    || (config.owners || []).map(String).includes(senderNumber);
  let metadata = null;
  if (isGroup) {
    try { metadata = await groupData(socket, jid); } catch {}
  }

  // Antienlaces: no afecta a administradores ni al dueño.
  if (isGroup && store?.group(jid).antilink && /(https?:\/\/|www\.)\S+/i.test(text)
      && !isAdmin(metadata, sender) && !isOwner && isAdmin(metadata, socket.user?.id)) {
    await socket.sendMessage(jid, { delete: message.key });
    await socket.sendMessage(jid, { text: `⚠️ @${senderNumber}, los enlaces no están permitidos.`, mentions: [sender] });
    return;
  }

  const prefix = config.prefix || '.';
  if (!text.startsWith(prefix)) return;
  const [rawCommand, ...args] = text.slice(prefix.length).trim().split(/\s+/);
  const plugin = plugins.get(rawCommand?.toLowerCase());
  if (!plugin) return;
  if (store?.settings.mode === 'private' && !isOwner) return;

  const reply = (replyText, options = {}) => socket.sendMessage(jid, { text: replyText, ...options }, { quoted: message });
  if (plugin.owner && !isOwner) return reply('❌ Este comando es exclusivo del dueño del bot.');
  if (plugin.group && !isGroup) return reply('👥 Este comando solo funciona en grupos.');
  if (plugin.admin && isGroup && !isAdmin(metadata, sender) && !isOwner) {
    return reply('🛡️ Necesitas ser administrador del grupo.');
  }
  if (plugin.botAdmin && isGroup && !isAdmin(metadata, socket.user?.id)) {
    return reply('🤖 Necesito permisos de administrador para hacer eso.');
  }

  const react = (emoji) => socket.sendMessage(jid, { react: { text: emoji, key: message.key } });
  try {
    await plugin.execute({
      socket, message, args, text: args.join(' '), command: rawCommand.toLowerCase(), prefix,
      plugins, config, startedAt, store, reply, react, isGroup, isOwner, sender, groupMetadata: metadata,
      paths: { bot: botDirectory, assets: path.join(botDirectory, 'assets'), lib: path.join(botDirectory, 'lib') }
    });
  } catch (error) {
    console.error(`[${config.name}] Error en ${rawCommand}: ${error.stack || error.message}`);
    await reply(`❌ No se pudo ejecutar ${prefix}${rawCommand}. ${error.userMessage || error.message}`.slice(0, 1000));
  }
}

export async function handleGroupUpdate({ socket, update, store, config }) {
  const { id, participants, action } = update;
  if (!store?.group(id).welcome || !['add', 'remove'].includes(action)) return;
  for (const participant of participants) {
    const user = participant.split('@')[0];
    const text = action === 'add'
      ? `👋 ¡Bienvenido/a @${user} al grupo!`
      : `👋 @${user} salió del grupo. ¡Hasta pronto!`;
    await socket.sendMessage(id, { text, mentions: [participant] });
  }
}

import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
const exec = promisify(execFile);

export default {
  name: 'toimg', aliases: ['imagen'], category: 'Utilidades', description: 'Convierte un sticker estático en imagen',
  async execute({ socket, message, reply }) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const media = quoted?.stickerMessage;
    if (!media || media.isAnimated) return reply('Responde a un sticker estático.');
    const directory = await mkdtemp(path.join(tmpdir(), 'multibots-image-'));
    try {
      const stream = await downloadContentFromMessage(media, 'sticker');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const input = path.join(directory, 'in.webp');
      const output = path.join(directory, 'out.png');
      await writeFile(input, Buffer.concat(chunks));
      await exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-frames:v', '1', output], { timeout: 30000 });
      await socket.sendMessage(message.key.remoteJid, { image: await readFile(output), caption: '🖼️ Aquí tienes la imagen.' }, { quoted: message });
    } finally { await rm(directory, { recursive: true, force: true }); }
  }
};

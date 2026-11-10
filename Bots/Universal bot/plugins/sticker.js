import { createSticker } from '../lib/sticker.js';

export default {
  name: 'sticker',
  aliases: ['s'],
  description: 'Convierte una imagen o video (máx. 6 s) en sticker',
  async execute({ socket, message, reply, react }) {
    await react('⏳');
    const sticker = await createSticker(message);
    await socket.sendMessage(message.key.remoteJid, { sticker }, { quoted: message });
    await react('✅');
  }
};

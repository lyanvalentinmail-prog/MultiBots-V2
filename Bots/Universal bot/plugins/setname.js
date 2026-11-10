export default {
  name: 'setname', aliases: ['nombregrupo'], category: 'Grupos', description: 'Cambia el nombre del grupo',
  group: true, admin: true, botAdmin: true,
  async execute({ socket, message, text, prefix, reply }) {
    if (!text) return reply(`Uso: ${prefix}setname <nuevo nombre>`);
    if (text.length > 100) return reply('❌ El nombre no puede superar 100 caracteres.');
    await socket.groupUpdateSubject(message.key.remoteJid, text);
    await reply('✅ Nombre del grupo actualizado.');
  }
};

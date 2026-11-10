export default {
  name: 'setdesc', aliases: ['descripcion'], category: 'Grupos', description: 'Cambia la descripción del grupo',
  group: true, admin: true, botAdmin: true,
  async execute({ socket, message, text, prefix, reply }) {
    if (!text) return reply(`Uso: ${prefix}setdesc <nueva descripción>`);
    await socket.groupUpdateDescription(message.key.remoteJid, text);
    await reply('✅ Descripción actualizada.');
  }
};

export default {
  name: 'link', aliases: ['enlace'], category: 'Grupos', description: 'Obtiene el enlace de invitación',
  group: true, botAdmin: true,
  async execute({ socket, message, reply }) {
    const code = await socket.groupInviteCode(message.key.remoteJid);
    await reply(`🔗 Enlace del grupo:\nhttps://chat.whatsapp.com/${code}`);
  }
};

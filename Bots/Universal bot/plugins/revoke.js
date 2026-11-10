export default {
  name: 'revoke', aliases: ['resetlink'], category: 'Grupos', description: 'Revoca y renueva el enlace del grupo',
  group: true, admin: true, botAdmin: true,
  async execute({ socket, message, reply }) {
    await socket.groupRevokeInvite(message.key.remoteJid);
    const code = await socket.groupInviteCode(message.key.remoteJid);
    await reply(`♻️ Enlace renovado:\nhttps://chat.whatsapp.com/${code}`);
  }
};

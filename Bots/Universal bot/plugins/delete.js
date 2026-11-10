export default {
  name: 'delete', aliases: ['del', 'borrar'], category: 'Grupos', description: 'Borra el mensaje al que respondes', group: true, admin: true,
  async execute({ socket, message, reply }) {
    const context = message.message?.extendedTextMessage?.contextInfo;
    const key = context?.quotedMessage ? {
      remoteJid: message.key.remoteJid,
      fromMe: context.participant === socket.user?.id,
      id: context.stanzaId,
      participant: context.participant
    } : null;
    if (!key) return reply('Responde al mensaje que quieres borrar.');
    await socket.sendMessage(message.key.remoteJid, { delete: key });
  }
};

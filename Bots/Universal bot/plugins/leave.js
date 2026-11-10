export default {
  name: 'leave', aliases: ['salirgrupo'], category: 'Dueño', description: 'Hace que el bot salga del grupo', owner: true, group: true,
  async execute({ socket, message }) {
    await socket.sendMessage(message.key.remoteJid, { text: '👋 Hasta pronto.' });
    await socket.groupLeave(message.key.remoteJid);
  }
};

export default {
  name: 'tagall', aliases: ['todos'], category: 'Grupos', description: 'Menciona a todos los integrantes',
  group: true, admin: true,
  async execute({ socket, message, groupMetadata, text, reply }) {
    const users = groupMetadata.participants.map((person) => person.id);
    const mentions = users.map((user) => `@${user.split('@')[0]}`).join(' ');
    await socket.sendMessage(message.key.remoteJid, { text: `📢 ${text || 'Atención a todos'}\n\n${mentions}`, mentions });
  }
};

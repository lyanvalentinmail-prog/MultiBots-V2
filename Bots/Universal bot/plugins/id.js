export default {
  name: 'id', aliases: ['jid'], category: 'Utilidades', description: 'Muestra el identificador del chat y del usuario',
  async execute({ message, sender, reply }) {
    await reply(`🆔 Chat: ${message.key.remoteJid}\n👤 Usuario: ${sender}`);
  }
};

export default {
  name: 'poll', aliases: ['encuesta'], category: 'Utilidades', description: 'Crea una encuesta: pregunta | opción 1 | opción 2',
  async execute({ socket, message, text, prefix, reply }) {
    const [name, ...values] = text.split('|').map((part) => part.trim()).filter(Boolean);
    if (!name || values.length < 2 || values.length > 12) return reply(`Uso: ${prefix}poll ¿Qué comemos? | Pizza | Tacos`);
    await socket.sendMessage(message.key.remoteJid, { poll: { name, values, selectableCount: 1 } });
  }
};

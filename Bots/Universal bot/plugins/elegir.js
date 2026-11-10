export default {
  name: 'elegir', aliases: ['choose'], category: 'Diversión', description: 'Elige entre opciones separadas por |',
  async execute({ text, prefix, reply }) {
    const options = text.split('|').map((option) => option.trim()).filter(Boolean);
    if (options.length < 2) return reply(`Uso: ${prefix}elegir pizza | hamburguesa | tacos`);
    await reply(`🤔 Yo elijo: *${options[Math.floor(Math.random() * options.length)]}*`);
  }
};

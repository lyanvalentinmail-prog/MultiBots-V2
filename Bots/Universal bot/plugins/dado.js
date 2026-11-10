export default {
  name: 'dado', aliases: ['dice'], category: 'Diversión', description: 'Lanza uno o varios dados: .dado 2',
  async execute({ args, reply }) {
    const count = Math.max(1, Math.min(Number.parseInt(args[0] || '1', 10) || 1, 10));
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
    await reply(`🎲 Resultados: ${rolls.join(', ')}\nTotal: ${rolls.reduce((a, b) => a + b, 0)}`);
  }
};

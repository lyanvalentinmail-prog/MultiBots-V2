export default {
  name: 'calc', aliases: ['calcular'], category: 'Utilidades', description: 'Resuelve una operación matemática',
  async execute({ text, prefix, reply }) {
    const expression = text.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
    if (!expression || expression.length > 100 || !/^[\d+\-*/(). %]+$/.test(expression)) {
      return reply(`Uso: ${prefix}calc (25 + 5) * 2`);
    }
    try {
      const result = Function(`"use strict"; return (${expression})`)();
      if (typeof result !== 'number' || !Number.isFinite(result)) throw new Error();
      await reply(`🧮 ${expression} = *${result}*`);
    } catch { await reply('❌ Operación matemática inválida.'); }
  }
};

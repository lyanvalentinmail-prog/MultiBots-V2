export default {
  name: 'moneda', aliases: ['coinflip'], category: 'Diversión', description: 'Lanza una moneda',
  async execute({ reply }) { await reply(`🪙 Ha salido: *${Math.random() < 0.5 ? 'CARA' : 'CRUZ'}*`); }
};

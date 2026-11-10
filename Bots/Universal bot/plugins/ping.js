export default {
  name: 'ping',
  description: 'Comprueba la velocidad de respuesta',
  async execute({ reply }) {
    const start = performance.now();
    await reply('🏓 Calculando...');
    await reply(`🏓 *Pong!*\nVelocidad: ${Math.round(performance.now() - start)} ms`);
  }
};

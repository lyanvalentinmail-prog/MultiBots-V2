import os from 'node:os';

function uptime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m ${seconds % 60}s`;
}

export default {
  name: 'info',
  aliases: ['infobot'],
  description: 'Muestra información del bot y del sistema',
  async execute({ config, prefix, startedAt, plugins, reply }) {
    const commands = new Set(plugins.values()).size;
    const memory = process.memoryUsage().rss / 1024 / 1024;
    await reply(`🤖 *${config.name}*\n\n` +
      `▸ Versión: ${config.version}\n` +
      `▸ Motor: Baileys\n` +
      `▸ Prefijo: ${prefix}\n` +
      `▸ Comandos: ${commands}\n` +
      `▸ Tiempo activo: ${uptime(Date.now() - startedAt)}\n` +
      `▸ Node.js: ${process.version}\n` +
      `▸ Memoria: ${memory.toFixed(1)} MB\n` +
      `▸ Sistema: ${os.type()} ${os.arch()}`);
  }
};

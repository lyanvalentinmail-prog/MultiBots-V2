export default {
  name: 'welcome', aliases: ['bienvenida'], category: 'Grupos', description: 'Activa/desactiva entradas y salidas: .welcome on/off',
  group: true, admin: true,
  async execute({ message, args, store, prefix, reply }) {
    const option = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(option)) return reply(`Uso: ${prefix}welcome on | off`);
    await store.update(() => { store.group(message.key.remoteJid).welcome = option === 'on'; });
    await reply(option === 'on' ? '👋 Bienvenidas activadas.' : '👋 Bienvenidas desactivadas.');
  }
};

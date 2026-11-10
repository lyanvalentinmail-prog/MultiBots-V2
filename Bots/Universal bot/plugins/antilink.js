export default {
  name: 'antilink', aliases: ['antienlace'], category: 'Grupos', description: 'Elimina enlaces de no administradores: .antilink on/off',
  group: true, admin: true, botAdmin: true,
  async execute({ message, args, store, prefix, reply }) {
    const option = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(option)) return reply(`Uso: ${prefix}antilink on | off`);
    await store.update(() => { store.group(message.key.remoteJid).antilink = option === 'on'; });
    await reply(`🛡️ Antienlaces ${option === 'on' ? 'activado' : 'desactivado'}.`);
  }
};

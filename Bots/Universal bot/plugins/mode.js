export default {
  name: 'mode', aliases: ['modo'], category: 'Dueño', description: 'Cambia entre modo público y privado', owner: true,
  async execute({ args, store, prefix, reply }) {
    const mode = args[0]?.toLowerCase();
    if (!['public', 'private'].includes(mode)) return reply(`Uso: ${prefix}mode public | private`);
    await store.update((settings) => { settings.mode = mode; });
    await reply(mode === 'public' ? '🌐 Modo público: todos pueden usar el bot.' : '🔐 Modo privado: solo el dueño puede usar comandos.');
  }
};

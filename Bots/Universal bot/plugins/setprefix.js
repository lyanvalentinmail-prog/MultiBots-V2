export default {
  name: 'setprefix', aliases: ['prefijo'], category: 'Dueño', description: 'Cambia el prefijo y lo guarda', owner: true,
  async execute({ args, config, store, reply }) {
    const prefix = args[0];
    if (!prefix || prefix.length > 3 || /\s/.test(prefix)) return reply('❌ Indica un prefijo de 1 a 3 caracteres, sin espacios.');
    await store.update((settings) => { settings.prefix = prefix; config.prefix = prefix; });
    await reply(`✅ Nuevo prefijo: ${prefix}`);
  }
};

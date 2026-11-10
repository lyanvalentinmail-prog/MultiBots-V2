export default {
  name: 'menu', aliases: ['help', 'ayuda'], category: 'General',
  description: 'Muestra los comandos disponibles',
  async execute({ plugins, prefix, config, reply, store }) {
    const unique = [...new Set(plugins.values())];
    const categories = {};
    for (const plugin of unique) (categories[plugin.category || 'Otros'] ||= []).push(plugin);
    const sections = Object.entries(categories).sort().map(([category, commands]) =>
      `╭─ *${category.toUpperCase()}*\n${commands.sort((a, b) => a.name.localeCompare(b.name)).map((p) => `│ ${prefix}${p.name} — ${p.description}`).join('\n')}\n╰─`
    ).join('\n\n');
    await reply(`🤖 *${config.name}* · v${config.version}\nModo: ${store?.settings.mode || 'public'} · Prefijo: ${prefix}\n\n${sections}\n\n_Usa ${prefix}comando <nombre> para ver detalles._`);
  }
};

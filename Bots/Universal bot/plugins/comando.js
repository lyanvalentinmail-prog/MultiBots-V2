export default {
  name: 'comando', aliases: ['cmdinfo'], category: 'General',
  description: 'Explica un comando y sus requisitos',
  async execute({ args, plugins, prefix, reply }) {
    const plugin = plugins.get((args[0] || '').replace(/^\./, '').toLowerCase());
    if (!plugin) return reply(`Uso: ${prefix}comando <nombre>`);
    const requirements = [plugin.owner && 'dueño', plugin.group && 'solo grupos', plugin.admin && 'admin del grupo', plugin.botAdmin && 'bot admin'].filter(Boolean);
    await reply(`ℹ️ *${prefix}${plugin.name}*\n${plugin.description}\n\nAlias: ${plugin.aliases?.join(', ') || 'ninguno'}\nRequisitos: ${requirements.join(', ') || 'ninguno'}`);
  }
};

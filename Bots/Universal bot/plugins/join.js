export default {
  name: 'join', aliases: ['unirse'], category: 'Dueño', description: 'Une el bot a un grupo mediante invitación', owner: true,
  async execute({ socket, args, prefix, reply }) {
    const code = args[0]?.match(/chat\.whatsapp\.com\/([\w-]+)/)?.[1];
    if (!code) return reply(`Uso: ${prefix}join <enlace de invitación>`);
    const jid = await socket.groupAcceptInvite(code);
    await reply(`✅ Me uní al grupo: ${jid}`);
  }
};

export default {
  name: 'broadcast', aliases: ['difundir'], category: 'Dueño', description: 'Envía un aviso a todos los grupos', owner: true,
  async execute({ socket, text, prefix, reply }) {
    if (!text) return reply(`Uso: ${prefix}broadcast <mensaje>`);
    const groups = await socket.groupFetchAllParticipating();
    const ids = Object.keys(groups);
    let sent = 0;
    for (const id of ids) {
      try {
        await socket.sendMessage(id, { text: `📢 *AVISO*\n\n${text}` });
        sent++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch {}
    }
    await reply(`✅ Aviso enviado a ${sent}/${ids.length} grupos.`);
  }
};

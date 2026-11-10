import { mentionedUsers, requireTargets } from '../lib/group.js';
export default {
  name: 'unblock', aliases: ['desbloquear'], category: 'Dueño', description: 'Desbloquea usuarios en WhatsApp', owner: true,
  async execute({ socket, message, args, reply }) {
    const users = requireTargets(mentionedUsers(message, args));
    for (const user of users) await socket.updateBlockStatus(user, 'unblock');
    await reply(`✅ ${users.length} usuario(s) desbloqueado(s).`);
  }
};

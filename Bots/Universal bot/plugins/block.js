import { mentionedUsers, requireTargets } from '../lib/group.js';
export default {
  name: 'block', aliases: ['bloquear'], category: 'Dueño', description: 'Bloquea usuarios en WhatsApp', owner: true,
  async execute({ socket, message, args, reply }) {
    const users = requireTargets(mentionedUsers(message, args));
    for (const user of users) await socket.updateBlockStatus(user, 'block');
    await reply(`🚫 ${users.length} usuario(s) bloqueado(s).`);
  }
};

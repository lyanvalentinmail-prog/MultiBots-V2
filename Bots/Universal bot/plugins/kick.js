import { mentionedUsers, requireTargets } from '../lib/group.js';
export default {
  name: 'kick', aliases: ['expulsar'], category: 'Grupos', description: 'Expulsa usuarios del grupo',
  group: true, admin: true, botAdmin: true,
  async execute({ socket, message, args, reply }) {
    const users = requireTargets(mentionedUsers(message, args));
    await socket.groupParticipantsUpdate(message.key.remoteJid, users, 'remove');
    await reply(`✅ ${users.length} usuario(s) expulsado(s).`);
  }
};

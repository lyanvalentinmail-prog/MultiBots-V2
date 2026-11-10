import { mentionedUsers, requireTargets } from '../lib/group.js';
export default {
  name: 'add', aliases: ['agregar'], category: 'Grupos', description: 'Agrega usuarios al grupo',
  group: true, admin: true, botAdmin: true,
  async execute({ socket, message, args, reply }) {
    const users = requireTargets(mentionedUsers(message, args));
    const results = await socket.groupParticipantsUpdate(message.key.remoteJid, users, 'add');
    await reply(`✅ Solicitud procesada para ${users.length} usuario(s).`, { mentions: users });
    return results;
  }
};

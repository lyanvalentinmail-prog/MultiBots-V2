import { mentionedUsers, requireTargets } from '../lib/group.js';
export default {
  name: 'demote', aliases: ['quitaradmin'], category: 'Grupos', description: 'Quita administración a usuarios',
  group: true, admin: true, botAdmin: true,
  async execute({ socket, message, args, reply }) {
    const users = requireTargets(mentionedUsers(message, args));
    await socket.groupParticipantsUpdate(message.key.remoteJid, users, 'demote');
    await reply('✅ Administrador(es) actualizado(s).');
  }
};

export default {
  name: 'group', aliases: ['grupo'], category: 'Grupos', description: 'Abre o cierra el grupo: .group open/close',
  group: true, admin: true, botAdmin: true,
  async execute({ socket, message, args, prefix, reply }) {
    const action = args[0]?.toLowerCase();
    const states = { open: 'not_announcement', abrir: 'not_announcement', close: 'announcement', cerrar: 'announcement' };
    if (!states[action]) return reply(`Uso: ${prefix}group open | close`);
    await socket.groupSettingUpdate(message.key.remoteJid, states[action]);
    await reply(states[action] === 'announcement' ? '🔒 Grupo cerrado: solo administradores pueden escribir.' : '🔓 Grupo abierto: todos pueden escribir.');
  }
};

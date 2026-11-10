export default {
  name: 'groupinfo', aliases: ['infogrupo'], category: 'Grupos', description: 'Muestra información del grupo', group: true,
  async execute({ groupMetadata, reply }) {
    const admins = groupMetadata.participants.filter((p) => p.admin).length;
    await reply(`👥 *${groupMetadata.subject}*\n\n🆔 ${groupMetadata.id}\n👤 Integrantes: ${groupMetadata.participants.length}\n🛡️ Administradores: ${admins}\n📅 Creado: ${new Date(groupMetadata.creation * 1000).toLocaleDateString('es-UY')}\n\n📝 ${groupMetadata.desc || 'Sin descripción'}`);
  }
};

export function normalizeJid(jid = '') {
  const number = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
  return number ? `${number}@s.whatsapp.net` : jid;
}

export function mentionedUsers(message, args = []) {
  const content = message.message?.extendedTextMessage
    || message.message?.imageMessage
    || message.message?.videoMessage;
  const mentions = content?.contextInfo?.mentionedJid || [];
  const quoted = content?.contextInfo?.participant;
  const numbers = args.filter((arg) => /^\d{8,15}$/.test(arg)).map((arg) => `${arg}@s.whatsapp.net`);
  return [...new Set([...mentions, quoted, ...numbers].filter(Boolean))];
}

export function requireTargets(users) {
  if (!users.length) throw new Error('Menciona a un usuario, responde a su mensaje o escribe su número con código de país.');
  return users;
}

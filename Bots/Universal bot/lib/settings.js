import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const defaults = { mode: 'public', prefix: null, groups: {} };

export async function loadSettings(botDirectory, config) {
  const directory = path.join(botDirectory, 'data');
  const file = path.join(directory, 'settings.json');
  let saved = {};
  try {
    saved = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`[${config.name}] Configuración dañada; se usarán valores predeterminados.`);
  }
  const settings = { ...defaults, ...saved, groups: saved.groups || {} };
  if (settings.prefix) config.prefix = settings.prefix;

  async function save() {
    await mkdir(directory, { recursive: true });
    const temporary = `${file}.tmp`;
    await writeFile(temporary, JSON.stringify(settings, null, 2));
    await rename(temporary, file);
  }

  return {
    settings,
    save,
    group(jid) {
      settings.groups[jid] ||= { welcome: false, antilink: false };
      return settings.groups[jid];
    },
    async update(callback) {
      const result = await callback(settings);
      await save();
      return result;
    }
  };
}

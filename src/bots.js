import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const botsDirectory = path.join(root, 'Bots');

/** Descubre los bots por su archivo bot.json, sin modificar el código central. */
export async function discoverBots() {
  const entries = await readdir(botsDirectory, { withFileTypes: true });
  const bots = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(botsDirectory, entry.name);
    try {
      const config = JSON.parse(await readFile(path.join(directory, 'bot.json'), 'utf8'));
      bots.push({
        id: entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: config.name || entry.name,
        description: config.description || 'Bot de WhatsApp',
        version: config.version || '1.0.0',
        prefix: config.prefix || '.',
        directory
      });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`No se pudo cargar ${entry.name}/bot.json: ${error.message}`);
      }
    }
  }

  return bots.sort((a, b) => a.name.localeCompare(b.name));
}

export function findBot(bots, value = '') {
  const query = value.trim().toLowerCase();
  if (/^\d+$/.test(query)) return bots[Number(query) - 1];
  return bots.find((bot) => bot.id === query || bot.name.toLowerCase() === query);
}

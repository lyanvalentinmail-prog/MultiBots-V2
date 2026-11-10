import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const execFileAsync = promisify(execFile);

function unwrap(message) {
  return message?.ephemeralMessage?.message
    || message?.viewOnceMessage?.message
    || message?.viewOnceMessageV2?.message
    || message;
}

export function getMedia(message) {
  const content = unwrap(message.message);
  const quoted = unwrap(content?.extendedTextMessage?.contextInfo?.quotedMessage);
  const source = content?.imageMessage || content?.videoMessage ? content : quoted;
  const media = source?.imageMessage || source?.videoMessage;
  if (!media) return null;
  return { media, type: source.imageMessage ? 'image' : 'video' };
}

async function bufferFromMedia(media, type) {
  const stream = await downloadContentFromMessage(media, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function createSticker(message) {
  const target = getMedia(message);
  if (!target) throw new Error('Envía una imagen/video con el comando o responde a uno.');
  const directory = await mkdtemp(path.join(tmpdir(), 'multibots-sticker-'));
  const input = path.join(directory, `input.${target.type === 'image' ? 'jpg' : 'mp4'}`);
  const output = path.join(directory, 'sticker.webp');

  try {
    await writeFile(input, await bufferFromMedia(target.media, target.type));
    const video = target.type === 'video';
    const filters = `${video ? 'fps=12,' : ''}scale=512:512:force_original_aspect_ratio=decrease`;
    const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-vf', filters];
    if (video) args.push('-t', '6', '-an', '-loop', '0');
    else args.push('-frames:v', '1', '-an');
    args.push('-c:v', 'libwebp', '-quality', '75', output);

    await execFileAsync('ffmpeg', args, { timeout: 45000, maxBuffer: 10 * 1024 * 1024 });
    return readFile(output);
  } catch (error) {
    if (error.code === 'ENOENT') {
      error.userMessage = 'ffmpeg no está instalado. En Termux ejecuta: pkg install ffmpeg';
    } else {
      error.userMessage = 'No se pudo convertir el archivo. Usa una imagen o un video de máximo 6 segundos.';
    }
    throw error;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

#!/usr/bin/env node
import readline from 'node:readline/promises';
import { discoverBots, findBot } from './bots.js';
import { BotManager } from './manager.js';

const color = (code, text) => `\u001b[${code}m${text}\u001b[0m`;
const cyan = (text) => color(36, text);
const green = (text) => color(32, text);
const yellow = (text) => color(33, text);
const bold = (text) => color(1, text);

const bots = await discoverBots();
const manager = new BotManager();
const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
let closing = false;

function banner() {
  console.log(cyan(bold(`
╔╦╗╦ ╦╦ ╔╦╗╦╔╗ ╔═╗╔╦╗╔═╗  ╦  ╦╔═╗
║║║║ ║║  ║ ║╠╩╗║ ║ ║ ╚═╗  ╚╗╔╝ ╔╝
╩ ╩╚═╝╩═╝╩ ╩╚═╝╚═╝ ╩ ╚═╝   ╚╝  ╚═╝`)));
  console.log(bold('Plataforma multibot para WhatsApp · Baileys · Termux'));
}

function help() {
  console.log(`
${bold('COMANDOS DE LA TERMINAL')}
  bots                         Lista los bots disponibles
  start [bot] [qr|code]        Inicia y vincula un bot
  stop <bot>                   Detiene un bot
  restart <bot>                Reinicia un bot conservando su sesión
  status                       Muestra el estado de los procesos
  clear                        Limpia la pantalla
  help                         Muestra esta ayuda
  exit                         Detiene los bots y sale

${bold('EJEMPLOS')}
  start 1 qr
  start "Universal bot" code
  stop 1

${yellow('Nota: la sesión queda guardada; solo tendrás que vincular una vez.')}`);
}

function listBots() {
  if (!bots.length) return console.log(yellow('No hay bots. Agrega una carpeta con bot.json dentro de Bots/.'));
  bots.forEach((bot, index) => {
    const running = manager.processes.has(bot.id);
    console.log(`${index + 1}. ${bold(bot.name)} ${running ? green('● EN LÍNEA') : '○ detenido'}`);
    console.log(`   ${bot.description} · prefijo ${bot.prefix}`);
  });
}

async function startWizard() {
  listBots();
  const selection = await terminal.question(cyan('Número o nombre del bot: '));
  const bot = findBot(bots, selection);
  if (!bot) throw new Error('Bot no encontrado.');
  const method = (await terminal.question(cyan('Vincular con QR o código? [qr/code]: '))).trim().toLowerCase() || 'qr';
  let phone = '';
  if (method === 'code') {
    phone = (await terminal.question(cyan('Teléfono con código de país (solo números): '))).replace(/\D/g, '');
  }
  manager.start(bot, method, phone);
  console.log(green(`Iniciando ${bot.name}...`));
}

async function execute(line) {
  const args = line.match(/(?:[^\s"]+|"[^"]*")+/g)?.map((arg) => arg.replace(/^"|"$/g, '')) || [];
  const [command, ...rest] = args;
  switch ((command || '').toLowerCase()) {
    case '':
      break;
    case 'help':
    case 'ayuda':
      help();
      break;
    case 'bots':
    case 'list':
      listBots();
      break;
    case 'start':
    case 'iniciar':
      if (!rest.length) {
        await startWizard();
      } else {
        const method = (rest.at(-1) || '').toLowerCase();
        const hasMethod = ['qr', 'code'].includes(method);
        const bot = findBot(bots, hasMethod ? rest.slice(0, -1).join(' ') : rest.join(' '));
        if (!bot) throw new Error('Bot no encontrado. Usa bots para ver la lista.');
        const selectedMethod = hasMethod ? method : 'qr';
        let phone = '';
        if (selectedMethod === 'code') {
          phone = (await terminal.question(cyan('Teléfono con código de país (solo números): '))).replace(/\D/g, '');
        }
        manager.start(bot, selectedMethod, phone);
        console.log(green(`Iniciando ${bot.name}...`));
      }
      break;
    case 'stop':
    case 'detener': {
      const bot = findBot(bots, rest.join(' '));
      if (!bot) throw new Error('Indica un bot válido, por ejemplo: stop 1');
      await manager.stop(bot);
      console.log(green(`${bot.name} detenido.`));
      break;
    }
    case 'restart':
    case 'reiniciar': {
      const bot = findBot(bots, rest.join(' '));
      if (!bot) throw new Error('Indica un bot válido, por ejemplo: restart 1');
      await manager.restart(bot);
      console.log(green(`${bot.name} reiniciado.`));
      break;
    }
    case 'status':
      manager.status(bots).forEach(({ bot, running, uptime }) => {
        const time = running ? ` · ${Math.floor(uptime / 1000)}s activo` : '';
        console.log(`${bot.name}: ${running ? green('EN EJECUCIÓN') : 'DETENIDO'}${time}`);
      });
      break;
    case 'clear':
      console.clear();
      banner();
      break;
    case 'exit':
    case 'salir':
      closing = true;
      console.log(yellow('Cerrando procesos...'));
      await manager.stopAll();
      terminal.close();
      return;
    default:
      console.log(yellow(`Comando desconocido: ${command}. Escribe help.`));
  }
}

banner();
console.log(`\n${bots.length} bot(s) disponible(s). Escribe ${bold('start')} para comenzar o ${bold('help')} para ayuda.\n`);

terminal.on('SIGINT', () => {
  console.log(yellow('\nUsa exit para cerrar la plataforma y todos los bots.'));
  terminal.prompt();
});
terminal.on('close', async () => {
  await manager.stopAll();
  if (!closing) process.exit(0);
});

while (!closing) {
  try {
    const line = await terminal.question(cyan('MultiBots ❯ '));
    await execute(line.trim());
  } catch (error) {
    if (closing || error.code === 'ERR_USE_AFTER_CLOSE') break;
    console.error(`Error: ${error.message}`);
  }
}
process.exit(0);

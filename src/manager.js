import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const runner = path.join(path.dirname(fileURLToPath(import.meta.url)), 'bot-runner.js');

export class BotManager {
  processes = new Map();

  start(bot, method = 'qr', phone = '') {
    if (this.processes.has(bot.id)) {
      throw new Error(`${bot.name} ya está en ejecución.`);
    }
    if (!['qr', 'code'].includes(method)) {
      throw new Error('El método de vinculación debe ser qr o code.');
    }
    if (method === 'code' && !/^\d{8,15}$/.test(phone)) {
      throw new Error('Escribe el teléfono con código de país, solo números (8-15 dígitos).');
    }

    const child = spawn(process.execPath, [runner, bot.directory], {
      stdio: 'inherit',
      env: {
        ...process.env,
        MULTIBOTS_AUTH_METHOD: method,
        MULTIBOTS_PHONE: phone,
        MULTIBOTS_NAME: bot.name
      }
    });
    const processInfo = { child, bot, method, phone, startedAt: Date.now() };
    this.processes.set(bot.id, processInfo);

    child.once('exit', (code, signal) => {
      if (this.processes.get(bot.id)?.child === child) this.processes.delete(bot.id);
      console.log(`\n[${bot.name}] Proceso finalizado (${signal || `código ${code}`}).`);
    });
    child.once('error', (error) => {
      this.processes.delete(bot.id);
      console.error(`[${bot.name}] No se pudo iniciar: ${error.message}`);
    });
    return processInfo;
  }

  async stop(bot) {
    const info = this.processes.get(bot.id);
    if (!info) throw new Error(`${bot.name} no está en ejecución.`);
    this.processes.delete(bot.id);
    info.child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => info.child.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 5000))
    ]);
    if (info.child.exitCode === null && info.child.signalCode === null) {
      info.child.kill('SIGKILL');
    }
  }

  async restart(bot) {
    const info = this.processes.get(bot.id);
    if (!info) throw new Error(`${bot.name} no está en ejecución.`);
    const { method, phone } = info;
    await this.stop(bot);
    return this.start(bot, method, phone);
  }

  status(bots) {
    return bots.map((bot) => ({
      bot,
      running: this.processes.has(bot.id),
      uptime: this.processes.has(bot.id) ? Date.now() - this.processes.get(bot.id).startedAt : 0
    }));
  }

  async stopAll() {
    const running = [...this.processes.values()];
    await Promise.all(running.map(({ bot }) => this.stop(bot).catch(() => {})));
  }
}

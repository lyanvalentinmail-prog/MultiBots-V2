#!/data/data/com.termux/files/usr/bin/bash
set -e

printf '\n\033[1;36mInstalando MultiBots-V2 para Termux...\033[0m\n\n'
pkg update -y
pkg install -y nodejs-lts ffmpeg git
npm install
printf '\n\033[1;32mInstalación completada. Ejecuta: npm start\033[0m\n\n'

#!/bin/bash
rm -rf ./dist/

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 18
npm install

mkdir -p dist

cp package.json dist/
cp package-lock.json dist/
cp index.js dist/

ssh -o StrictHostKeyChecking=no -l root "$SERVER_IP" <<ENDSSH
cd /root/apps/sb-proxy
rm -rf dist/
exit
ENDSSH

scp -o StrictHostKeyChecking=no -r dist/ root@"$SERVER_IP":/root/apps/sb-proxy/

ssh -tt -o StrictHostKeyChecking=no -l root "$SERVER_IP" <<ENDSSH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm ls
cd /root/apps/sb-proxy/dist
nvm use 18
npm install --production
cp ../pm2.json ./
pm2 restart pm2.json
exit
ENDSSH

rm -rf ./dist/
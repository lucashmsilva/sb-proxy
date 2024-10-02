#!/bin/bash
set -e

SERVER_IP=$1;

docker build -t lucashmsilva/sponsor-block-proxy:latest .
docker push lucashmsilva/sponsor-block-proxy:latest

ssh -tt -o StrictHostKeyChecking=no -l root "$SERVER_IP" <<ENDSSH
  cd /root/apps/sb-proxy/

  docker-compose -f docker-compose.yml stop
  docker-compose -f docker-compose.yml rm -f
  docker-compose -f docker-compose.yml pull
  docker-compose -f docker-compose.yml up -d

  exit
ENDSSH

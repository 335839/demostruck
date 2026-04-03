#!/usr/bin/env bash
set -e

SERVER_USER=ubuntu
SERVER_HOST=your.server.host
SSH_KEY_PATH=~/.ssh/id_rsa

echo "Deploying to ${SERVER_USER}@${SERVER_HOST}..."

ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_HOST}" << 'EOF'
  cd ~/struck
  git pull
  docker-compose down
  docker-compose up --build -d
EOF

echo "Deploy complete"

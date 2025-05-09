#!/bin/bash

# Set the path to your Node.js installation
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to your project directory
cd /cd rentease-app

# Run the TypeScript script
npx ts-node scripts/update-balances.ts >> /var/log/balance-updates.log 2>&1
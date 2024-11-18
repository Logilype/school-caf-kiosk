#!/bin/bash

# Create new directory structure
mkdir -p client/src/main
mkdir -p client/src/renderer/webfiles
mkdir -p client/config
mkdir -p server/src/{routes,controllers,models}
mkdir -p server/config
mkdir -p server/public
mkdir -p deployment/{scripts,systemd}

# Move client files
mv client/index.js client/src/main/
mv client/webfiles/* client/src/renderer/webfiles/
mv client/config.json client/config/

# Move server files
mv server/data/menu.html server/public/
mv server/data/styles.css server/public/
mv stylesold.css server/public/styles.backup.css

# Move deployment files
mv caf-client/cafclient.service deployment/systemd/
mv caf-client/deploy.sh deployment/scripts/
mv caf-client/readme.txt README.md

# Update package.json paths
sed -i 's/"main": "index.js"/"main": "src\/main\/index.js"/' client/package.json

echo "Directory restructure complete!" 
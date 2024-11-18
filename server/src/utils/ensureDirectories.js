const fs = require('fs');
const path = require('path');

function ensureDirectories() {
    const dirs = [
        'media',
        'data',
        'data/dashboard',
        'data/dashboard/pages',
        'public',
        'config'
    ];

    const requiredFiles = {
        'data/settings.json': '{}',
        'data/offers.json': '[]',
        'data/menuentries.json': '[]',
        'data/menuSelections.json': '[]',
        'data/advertisements.json': '[]',
        'data/accounts.json': '[{"username":"admin","password":"admin"}]'
    };

    // Create directories if they don't exist
    dirs.forEach(dir => {
        const fullPath = path.join(__dirname, '../../', dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`Created directory: ${fullPath}`);
        }
    });

    // Only create required JSON files if they don't exist
    Object.entries(requiredFiles).forEach(([file, defaultContent]) => {
        const fullPath = path.join(__dirname, '../../', file);
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, defaultContent);
            console.log(`Created file: ${fullPath}`);
        }
    });
}

module.exports = ensureDirectories; 
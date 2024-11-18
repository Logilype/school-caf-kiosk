const fs = require('fs');
const path = require('path');

function reorganize() {
    console.log('Starting file reorganization...');
    
    // List all files in data directory
    const dataDir = path.join(__dirname, '../data');
    console.log('Current files in data directory:');
    listFiles(dataDir);
    
    // Don't move anything yet, just show what would be moved
    console.log('\nProposed changes:');
    console.log('- Keep dashboard files in current location');
    console.log('- Move any CSS files to public/css');
    console.log('- Move any JS files to public/js');
    
    console.log('\nWould you like to proceed with these changes? (Y/N)');
}

function listFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            console.log(`[DIR] ${fullPath}`);
            listFiles(fullPath);
        } else {
            console.log(`[FILE] ${fullPath}`);
        }
    });
}

// Only run if called directly
if (require.main === module) {
    reorganize();
}

module.exports = reorganize; 
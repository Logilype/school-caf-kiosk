const fs = require('fs');
const path = require('path');

function moveCSS() {
    // Create public/css directory if it doesn't exist
    const cssDir = path.join(__dirname, '../public/css');
    if (!fs.existsSync(cssDir)) {
        fs.mkdirSync(cssDir, { recursive: true });
    }

    // Source directories to check for CSS files
    const sourceDirs = [
        path.join(__dirname, '../data'),
        path.join(__dirname, '../data/dashboard/templates'),
        path.join(__dirname, '../data/dashboard/pages')
    ];

    sourceDirs.forEach(sourceDir => {
        if (fs.existsSync(sourceDir)) {
            const files = fs.readdirSync(sourceDir);
            
            files.filter(file => file.endsWith('.css')).forEach(cssFile => {
                const sourcePath = path.join(sourceDir, cssFile);
                const destPath = path.join(cssDir, cssFile);
                
                // Copy instead of move to preserve originals
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied ${cssFile} to public/css/`);
            });
        }
    });
}

moveCSS(); 
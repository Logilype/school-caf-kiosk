const fs = require('fs');
const path = require('path');

function reorganizeFiles() {
    const sourceDir = path.join(__dirname, '../../data');
    const templatesDir = path.join(sourceDir, 'dashboard/templates');
    
    // Create necessary directories
    const dirs = [
        'public/css',
        'public/js',
        'public/images',
        'data/dashboard/pages'
    ].map(dir => path.join(__dirname, '../../', dir));

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });

    // Move files from templates directory to pages
    if (fs.existsSync(templatesDir)) {
        const templateFiles = fs.readdirSync(templatesDir);
        templateFiles.forEach(file => {
            const sourcePath = path.join(templatesDir, file);
            const destPath = path.join(sourceDir, 'dashboard/pages', file);
            
            if (!fs.existsSync(destPath)) {
                fs.renameSync(sourcePath, destPath);
                console.log(`Moved ${file} from templates to pages directory`);
            }
        });
        
        // Remove empty templates directory
        if (fs.readdirSync(templatesDir).length === 0) {
            fs.rmdirSync(templatesDir);
            console.log('Removed empty templates directory');
        }
    }

    // Move HTML files from root data directory to pages
    const rootHtmlFiles = fs.readdirSync(sourceDir)
        .filter(file => file.endsWith('.html'));
    
    rootHtmlFiles.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(sourceDir, 'dashboard/pages', file);
        
        // Only move if file doesn't already exist in pages directory
        if (!fs.existsSync(destPath)) {
            fs.renameSync(sourcePath, destPath);
            console.log(`Moved ${file} from data root to pages directory`);
        }
    });

    // Move CSS files to public/css
    const cssFiles = fs.readdirSync(sourceDir)
        .filter(file => file.endsWith('.css'));
    
    cssFiles.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(__dirname, '../../public/css', file);
        
        if (!fs.existsSync(destPath)) {
            fs.renameSync(sourcePath, destPath);
            console.log(`Moved ${file} to public/css directory`);
        }
    });

    console.log('File reorganization complete!');
}

module.exports = reorganizeFiles; 
const fs = require('fs').promises;
const path = require('path');

const configPath = path.join(__dirname, '../../config/display-config.json');

exports.getConfig = async (req, res) => {
    try {
        const config = await fs.readFile(configPath, 'utf8');
        res.json(JSON.parse(config));
    } catch (error) {
        console.error('Error reading config:', error);
        res.status(500).send('Error reading configuration');
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const newConfig = req.body;
        await fs.writeFile(configPath, JSON.stringify(newConfig, null, 4));
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).send('Error updating configuration');
    }
}; 
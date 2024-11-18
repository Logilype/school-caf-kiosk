const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'media/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const limits = {
    fileSize: 3 * 1024 * 1024, // 3MB limit
};

const upload = multer({ storage, limits });

// Get current settings
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/settings.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading settings file:', err);
        res.status(500).send('Error reading settings');
    }
});

// Update settings
router.post('/', auth, async (req, res) => {
    try {
        await fs.writeFile(
            path.join(__dirname, '../../data/settings.json'),
            JSON.stringify(req.body, null, 2)
        );
        res.send('Settings updated successfully');
    } catch (err) {
        console.error('Error writing settings file:', err);
        res.status(500).send('Error saving settings');
    }
});

// Get list of media files
router.get('/media', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(__dirname, '../../media'));
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
        const imagePaths = imageFiles.map(file => `/media/${file}`);
        res.json(imagePaths);
    } catch (err) {
        console.error('Error reading media directory:', err);
        res.status(500).send('Error reading media files');
    }
});

// Upload media file
router.post('/media/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.json({ path: `/media/${req.file.filename}` });
});

// Delete media file
router.delete('/media/:filename', auth, async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../../media', req.params.filename);
        await fs.unlink(filePath);
        res.send('Image deleted successfully');
    } catch (err) {
        console.error('Error deleting image:', err);
        res.status(500).send('Error deleting image');
    }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [offersData, menuEntriesData, settingsData] = await Promise.all([
            fs.readFile(path.join(__dirname, '../../data/offers.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/settings.json'), 'utf8')
        ]);

        const offers = JSON.parse(offersData);
        const menuEntries = JSON.parse(menuEntriesData);
        const settings = JSON.parse(settingsData);

        const stats = {
            activeOffers: offers.filter(offer => offer.visibility).length,
            menuEntries: menuEntries.length,
            activeAds: settings.advertising ? 1 : 0
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Error fetching dashboard statistics' });
    }
});

module.exports = router; 
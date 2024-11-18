const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../media'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Dashboard pages
router.get('/', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/dashboard/pages/panel.html'));
});

router.get('/settings', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/dashboard/pages/settings.html'));
});

router.get('/media', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/menuedit.html'));
});

router.get('/menu', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/menuedit.html'));
});

router.get('/offers', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/offersedit.html'));
});

router.get('/advertising', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/advertising.html'));
});

// API endpoints for dashboard functionality
router.get('/api/stats', auth, async (req, res) => {
    try {
        const [offersData, menuData, settingsData] = await Promise.all([
            fs.readFile(path.join(__dirname, '../../data/offers.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/settings.json'), 'utf8')
        ]);

        const stats = {
            offers: JSON.parse(offersData).length,
            menuItems: JSON.parse(menuData).length,
            settings: Object.keys(JSON.parse(settingsData)).length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ error: 'Failed to get dashboard statistics' });
    }
});

// Media upload endpoint
router.post('/api/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
        filename: req.file.filename,
        path: `/media/${req.file.filename}`
    });
});

// Media list endpoint
router.get('/api/media', auth, async (req, res) => {
    try {
        const mediaDir = path.join(__dirname, '../../media');
        const files = await fs.readdir(mediaDir);
        const mediaFiles = files.map(file => ({
            name: file,
            path: `/media/${file}`,
            type: path.extname(file).toLowerCase()
        }));
        res.json(mediaFiles);
    } catch (error) {
        console.error('Error listing media:', error);
        res.status(500).json({ error: 'Failed to list media files' });
    }
});

// Media delete endpoint
router.delete('/api/media/:filename', auth, async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../../media', req.params.filename);
        await fs.unlink(filePath);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ error: 'Failed to delete media file' });
    }
});

module.exports = router; 
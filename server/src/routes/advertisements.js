const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');

// Get all advertisements
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/advertisements.json'), 'utf8');
        const ads = JSON.parse(data);
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: 'Error reading advertisements' });
    }
});

// Create new advertisement
router.post('/', auth, async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/advertisements.json'), 'utf8');
        const ads = JSON.parse(data);
        const newAd = {
            id: Date.now().toString(),
            ...req.body
        };
        ads.push(newAd);
        await fs.writeFile(
            path.join(__dirname, '../../data/advertisements.json'), 
            JSON.stringify(ads, null, 2)
        );
        res.json(newAd);
    } catch (error) {
        res.status(500).json({ error: 'Error creating advertisement' });
    }
});

// Update advertisement
router.put('/:id', auth, async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/advertisements.json'), 'utf8');
        const ads = JSON.parse(data);
        const index = ads.findIndex(ad => ad.id === req.params.id);
        
        if (index !== -1) {
            ads[index] = { ...ads[index], ...req.body };
            await fs.writeFile(
                path.join(__dirname, '../../data/advertisements.json'), 
                JSON.stringify(ads, null, 2)
            );
            res.json(ads[index]);
        } else {
            res.status(404).json({ error: 'Advertisement not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating advertisement' });
    }
});

// Delete advertisement
router.delete('/:id', auth, async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/advertisements.json'), 'utf8');
        const ads = JSON.parse(data);
        const filteredAds = ads.filter(ad => ad.id !== req.params.id);
        
        await fs.writeFile(
            path.join(__dirname, '../../data/advertisements.json'), 
            JSON.stringify(filteredAds, null, 2)
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting advertisement' });
    }
});

// Get advertisement display data
router.get('/display', async (req, res) => {
    try {
        const [adsData, templateData] = await Promise.all([
            fs.readFile(path.join(__dirname, '../../data/advertisements.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/advertising_display.html'), 'utf8')
        ]);
        
        const ads = JSON.parse(adsData);
        const enabledAds = ads.filter(ad => ad.enabled);
        const html = templateData.replace('(datarenderplace)', JSON.stringify(enabledAds));
        res.send(html);
    } catch (error) {
        console.error('Error serving advertisement display:', error);
        res.status(500).send('Error serving advertisement display');
    }
});

module.exports = router; 
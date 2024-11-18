const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');

// Get all offers
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/offers.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading offers:', err);
        res.status(500).send('Error reading offers');
    }
});

// Edit offer
router.post('/edit', auth, async (req, res) => {
    const { id, name, price, image, days, visibility } = req.body;
    
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/offers.json'), 'utf8');
        let menu = JSON.parse(data);
        
        const index = menu.findIndex(item => item.id === id);
        if (index === -1) {
            return res.send("error");
        }

        menu[index] = { ...menu[index], name, price, image, days, visibility };
        
        await fs.writeFile(
            path.join(__dirname, '../../data/offers.json'), 
            JSON.stringify(menu, null, 2)
        );
        res.send("success");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete offer
router.post('/delete', auth, async (req, res) => {
    const { id } = req.body;
    
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/offers.json'), 'utf8');
        let menu = JSON.parse(data);
        
        menu = menu.filter(item => String(item.id) !== String(id));
        
        await fs.writeFile(
            path.join(__dirname, '../../data/offers.json'), 
            JSON.stringify(menu, null, 2)
        );
        res.send("success");
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router; 
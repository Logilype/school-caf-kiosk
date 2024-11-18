const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');

// Get all menu entries
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading menuentries.json:', err);
        res.status(500).send('Error reading menu entries');
    }
});

// Get menu entries by category
router.get('/category/:category', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8');
        const menuEntries = JSON.parse(data);
        const categoryEntries = menuEntries.filter(entry => 
            entry.category === req.params.category
        );
        res.json(categoryEntries);
    } catch (err) {
        console.error('Error reading menu entries:', err);
        res.status(500).send('Error reading menu entries');
    }
});

// Create new menu entry
router.post('/', auth, async (req, res) => {
    const { name, category, price } = req.body;
    const id = Math.random().toString(36).substr(2, 6);

    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8');
        let menuEntries = JSON.parse(data);
        
        const newEntry = { id, name, category, price };
        menuEntries.push(newEntry);

        await fs.writeFile(
            path.join(__dirname, '../../data/menuentries.json'),
            JSON.stringify(menuEntries, null, 2)
        );
        res.send("success");
    } catch (err) {
        console.error('Error saving new menu entry:', err);
        res.status(500).send('Error saving menu entry');
    }
});

// Edit menu entry
router.post('/edit', auth, async (req, res) => {
    const { id, name, category, price } = req.body;

    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8');
        let menuEntries = JSON.parse(data);
        
        const entryIndex = menuEntries.findIndex(entry => entry.id === id);
        if (entryIndex === -1) {
            return res.status(404).send('Entry not found');
        }

        menuEntries[entryIndex] = { ...menuEntries[entryIndex], name, category, price };

        await fs.writeFile(
            path.join(__dirname, '../../data/menuentries.json'),
            JSON.stringify(menuEntries, null, 2)
        );
        res.send("success");
    } catch (err) {
        console.error('Error updating menu entry:', err);
        res.status(500).send('Error updating menu entry');
    }
});

// Delete menu entry
router.post('/delete', auth, async (req, res) => {
    const { id } = req.body;

    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8');
        let menuEntries = JSON.parse(data);
        
        menuEntries = menuEntries.filter(entry => entry.id !== id);

        await fs.writeFile(
            path.join(__dirname, '../../data/menuentries.json'),
            JSON.stringify(menuEntries, null, 2)
        );
        res.send("success");
    } catch (err) {
        console.error('Error deleting menu entry:', err);
        res.status(500).send('Error deleting menu entry');
    }
});

// Save menu selections
router.post('/selections', auth, async (req, res) => {
    try {
        await fs.writeFile(
            path.join(__dirname, '../../data/menuSelections.json'),
            JSON.stringify(req.body, null, 2)
        );
        res.send('Ausgewählte Speiseplaneinträge erfolgreich gespeichert. Nachdem Sie auf OK klicken, lädt sich die Seite neu');
    } catch (err) {
        console.error('Error saving menu selections:', err);
        res.status(500).send('Error saving menu selections');
    }
});

// Get menu selections
router.get('/selections', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/menuSelections.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading menu selections:', err);
        res.status(500).send('Error loading menu selections');
    }
});

module.exports = router; 
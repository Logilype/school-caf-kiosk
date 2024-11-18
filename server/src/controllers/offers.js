const fs = require('fs').promises;
const path = require('path');

const offersPath = path.join(__dirname, '../../data/offers.json');

exports.getOffers = async (req, res) => {
    try {
        const offers = await fs.readFile(offersPath, 'utf8');
        res.json(JSON.parse(offers));
    } catch (error) {
        console.error('Error reading offers:', error);
        res.status(500).send('Error reading offers');
    }
};

exports.createOffer = async (req, res) => {
    try {
        const newOffer = req.body;
        const offers = JSON.parse(await fs.readFile(offersPath, 'utf8'));
        offers.push(newOffer);
        await fs.writeFile(offersPath, JSON.stringify(offers, null, 4));
        res.json(newOffer);
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).send('Error creating offer');
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedOffer = req.body;
        const offers = JSON.parse(await fs.readFile(offersPath, 'utf8'));
        const index = offers.findIndex(offer => offer.id === id);
        if (index !== -1) {
            offers[index] = { ...offers[index], ...updatedOffer };
            await fs.writeFile(offersPath, JSON.stringify(offers, null, 4));
            res.json(offers[index]);
        } else {
            res.status(404).send('Offer not found');
        }
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).send('Error updating offer');
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offers = JSON.parse(await fs.readFile(offersPath, 'utf8'));
        const filteredOffers = offers.filter(offer => offer.id !== id);
        await fs.writeFile(offersPath, JSON.stringify(filteredOffers, null, 4));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).send('Error deleting offer');
    }
}; 
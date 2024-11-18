const express = require('express');
const router = express.Router();
const displayConfig = require('../controllers/displayConfig');
const offers = require('../controllers/offers');

// Display config routes
router.get('/display-config', displayConfig.getConfig);
router.put('/display-config', displayConfig.updateConfig);

// Offers routes
router.get('/offers', offers.getOffers);
router.post('/offers', offers.createOffer);
router.put('/offers/:id', offers.updateOffer);
router.delete('/offers/:id', offers.deleteOffer);

module.exports = router; 
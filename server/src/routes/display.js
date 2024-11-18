const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const XMLHttpRequest = require('xhr2');

// Get news data
router.get('/news', (req, res) => {
    const xmlht = new XMLHttpRequest();
    xmlht.open("GET", "https://www.tagesschau.de/api2/news/?regions=1&ressort=inland", true);
    xmlht.send();
    
    xmlht.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                const news = JSON.parse(this.responseText);
                const newsarray = news.news.slice(0, 16).map(item => ({
                    headline: item.title,
                    image: item.teaserImage.imageVariants['16x9-1920'],
                    firstsentence: item.firstSentence,
                    url: item.shareURL
                }));

                const template = await fs.readFile(
                    path.join(__dirname, '../../data/news.html'),
                    'utf8'
                );
                
                const html = template.replace(
                    "(datainsertanchor)", 
                    JSON.stringify(newsarray)
                );
                res.send(html);
            } catch (error) {
                console.error('Error processing news:', error);
                res.status(500).send('Error processing news data');
            }
        }
    };
});

// Get display sequence
router.get('/sequence', async (req, res) => {
    try {
        const data = await fs.readFile(
            path.join(__dirname, '../../data/displayseq.json'),
            'utf8'
        );
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading display sequence:', error);
        res.status(500).send('Error reading display sequence');
    }
});

// Get offers display
router.get('/offers', async (req, res) => {
    try {
        const [offersData, templateData] = await Promise.all([
            fs.readFile(path.join(__dirname, '../../data/offers.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/offers.html'), 'utf8')
        ]);

        const offers = JSON.parse(offersData);
        const dailyOffers = offers.filter(offer => 
            offer.visibility && offer.type === 'daily'
        );
        const weeklyOffers = offers.filter(offer => 
            offer.visibility && offer.type === 'weekly'
        );

        const html = templateData.replace('(datarenderplace)', JSON.stringify({
            daily: dailyOffers,
            weekly: weeklyOffers
        }));
        res.send(html);
    } catch (error) {
        console.error('Error serving offers display:', error);
        res.status(500).send('Error serving offers display');
    }
});

// Get menu display
router.get('/menu', async (req, res) => {
    try {
        const [entriesData, selectionsData, templateData] = await Promise.all([
            fs.readFile(path.join(__dirname, '../../data/menuentries.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/menuSelections.json'), 'utf8'),
            fs.readFile(path.join(__dirname, '../../data/menu.html'), 'utf8')
        ]);

        const html = templateData.replace('(datarenderplace)', selectionsData);
        res.send(html);
    } catch (error) {
        console.error('Error serving menu display:', error);
        res.status(500).send('Error serving menu display');
    }
});

module.exports = router; 
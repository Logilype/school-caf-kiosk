const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const tokenStore = require('../utils/tokenStore');

// Serve login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/dashboard/pages/login.html'));
});

// Handle login POST request
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const data = await fs.readFile(path.join(__dirname, '../../data/accounts.json'), 'utf8');
        const accounts = JSON.parse(data);
        
        const validUser = accounts.find(account => 
            account.username === username && account.password === password
        );
        
        if (validUser) {
            const token = tokenStore.generateToken();
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

module.exports = router; 
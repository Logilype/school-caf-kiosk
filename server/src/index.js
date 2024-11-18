const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ensureDirectories = require('./utils/ensureDirectories');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const offersRoutes = require('./routes/offers');
const advertisementsRoutes = require('./routes/advertisements');
const menuRoutes = require('./routes/menu');
const settingsRoutes = require('./routes/settings');
const displayRoutes = require('./routes/display');
const panelRoutes = require('./routes/panel');

// Path configuration
const PATHS = {
    public: path.join(__dirname, '../public'),
    media: path.join(__dirname, '../media'),
    data: path.join(__dirname, '../data'),
    pages: path.join(__dirname, '../data/dashboard/pages')
};

// Initialize express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving
app.use(express.static(PATHS.public));
app.use('/media', express.static(PATHS.media));
app.use('/css', express.static(path.join(PATHS.public, 'css')));
app.use('/js', express.static(path.join(PATHS.public, 'js')));
app.use('/data', express.static(PATHS.data));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter); // Only apply to API routes

// Routes
app.use('/auth', authRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/advertisements', advertisementsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/display', displayRoutes);
app.use('/panel', panelRoutes);

// Public offers display route
app.get('/getoffers', (req, res) => {
    fs.readFile('data/offers.html', 'utf8', (err, template) => {
        if (err) {
            console.error('Error reading offers.html:', err);
            return res.status(500).send('Error reading template');
        }
        
        const html = template.replace('(datarenderplace)', JSON.stringify({
            daily: dailyOffers,
            weekly: weeklyOffers
        }));
        res.send(html);
    });
});

// Add these missing public routes
app.get('/getmenu', (req, res) => {
    fs.readFile('data/menu.html', 'utf8', (err, template) => {
        // ... menu rendering code ...
    });
});

app.get('/getadvertising', (req, res) => {
    fs.readFile('data/advertising_display.html', 'utf8', (err, template) => {
        // ... advertising rendering code ...
    });
});

// Redirect root to login if not authenticated
app.get('/', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.redirect('/auth/login');
    } else {
        res.redirect('/panel');
    }
});

// Ensure required directories exist
ensureDirectories();

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app; 

// Add this function that's used in the routes
function checktoken(token) {
    return tokenStore.verifyToken(token);
} 
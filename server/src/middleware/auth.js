const tokenStore = require('../utils/tokenStore');

const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).redirect('/auth/login');
    }
    
    try {
        const isValid = tokenStore.verifyToken(token);
        if (!isValid) {
            return res.status(401).redirect('/auth/login');
        }
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).redirect('/auth/login');
    }
};

module.exports = auth; 
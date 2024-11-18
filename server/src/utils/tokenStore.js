const crypto = require('crypto');

class TokenStore {
    constructor() {
        this.tokens = new Set();
    }

    generateToken() {
        const token = crypto.randomBytes(32).toString('hex');
        this.tokens.add(token);
        return token;
    }

    verifyToken(token) {
        return this.tokens.has(token);
    }

    removeToken(token) {
        this.tokens.delete(token);
    }
}

module.exports = new TokenStore(); 
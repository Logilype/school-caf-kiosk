const tokenStore = require('./tokenStore');

function checkToken(token) {
    return tokenStore.hasToken(token);
}

module.exports = checkToken; 
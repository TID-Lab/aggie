const { createHash } = require('crypto');

/**
 * Generates a hexidecimal SHA-256 hash from the provided string.
 */
function hash(str) {
    if (!str) return '';
    const shaHash = createHash('sha256');
    return shaHash.update(str).digest('hex');
}

module.exports = hash;
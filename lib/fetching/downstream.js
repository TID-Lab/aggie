/**
 * A Downstream instance shared across the fetching process.
 */

const { Downstream } = require('downstream');

const downstream = new Downstream();

module.exports = downstream;
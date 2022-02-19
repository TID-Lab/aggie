// Saves each Report to the Aggie database

const Report = require('../../models/report');

module.exports = async function saveToDatabase(report, next) {
    await Report.create(report);
    await next();
}
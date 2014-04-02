// Loads BotMaster and ReportWriter to start the fetch/write process
module.exports = {
  botMaster: require('./fetching/bot-master'),
  reportWriter: require('./fetching/report-writer')
};

// const { google } = require('googleapis');
const Client = require('./client.js');
// const Sheets = require('./sheets/index.js');
const SlackBot = require('./slackbot/index.js');
const Cron = require('./cron/index.js');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

const bot = new SlackBot();

Client.authorize()
.then(() => {
  pino.info('Google Sheets API connected!');
  // addUser();
  // Sheets.addNewSheet('ChannelId');
  return bot.initBot();
})
.then(() => {
  pino.info('SlackBot connected!');
  const cron = new Cron(bot.getBotInstance());
  cron.startJobs();
})
.catch((err) => {
  pino.error(err);
});

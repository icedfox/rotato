const { google } = require('googleapis');
const Client = require('./client.js');
const Sheets = require('./sheets/index.js');
const SlackBot = require('./slackbot/index.js');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

Client.authorize()
  .then(() => {
    pino.info('Google Sheets API connected!');
    // addUser();
    // Sheets.addNewSheet('ChannelId');
    const bot = new SlackBot();
    return bot.initBot();
  })
  .then(() => {
    pino.info('SlackBot connected!');
  })
  .catch((err) => {
    pino.error(err);
  });

const { google } = require('googleapis');
const Client = require('./client.js');
const Sheets = require('./sheets/index.js');
const SlackBot = require('./slackbot/index.js');
const pino = require('pino')();

Client.authorize()
  .then(() => {
    // addUser();
    // Sheets.addNewSheet('ChannelId');
    new SlackBot(); //eslint-disable-line
  })
  .catch((err) => {
    pino.error(err);
  });

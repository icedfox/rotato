const { google } = require('googleapis');
const Client = require('./client.js');
const Sheets = require('./sheets/index.js');
const SlackBot = require('./slackbot/index.js');

Client.authorize()
  .then(() => {
    // addUser();
    // Sheets.addNewSheet('ChannelId');
    new SlackBot();
  })
  .catch((err) => {
    console.log('Error happened', err);
  });

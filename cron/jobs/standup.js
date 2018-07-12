const { CronJob } = require('cron');
const Sheets = require('../../sheets/index.js');
const autoBind = require('auto-bind');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

class StandupJob {
  constructor() {
    this.job = new CronJob({
      cronTime: '00 * 11 * * *',
      onTick: () => { return this.chooseFacilitator(); },
      start: false
    });

    autoBind(this);
  }

  chooseOne(users) {
    const n = Math.min(...users.map((user) => { return user.standup.count; }));
    // filter out the users with the lowest count
    const victims = users.filter((user) => {
      return user.standup.count === n;
    });
    // return the victim
    return victims[Math.floor(Math.random() * victims.length)];
  }

  chooseFacilitator() {
    pino.info('Choosing facilitator for standup');
    const sheets = [];
    Sheets.getSpreadsheetDetails()
    .then((result) => {
      // Get all sheets from the spreadsheet
      const sheetsToFetch = result.data.sheets.map((sheetData) => {
        return sheetData.properties.title;
      });
      sheetsToFetch.forEach((sheet) => {
        sheets.push({ channel: sheet.split('_')[0] });
      });

      return Promise.all(sheetsToFetch.map((sheet) => { return Sheets.listUsers(sheet); }));
    })
    .then((users) => {
      const facilitators = users.map(this.chooseOne);
      for (let i = 0; i < sheets.length; i += 1) {
        sheets[i].facilitator = facilitators[i];
      }
      console.log('*** what are sheets now?', sheets);
      // TODO
      // increment count and announce to channel
    });
  }

  start() {
    pino.info('Starting facilitator job');
    this.job.start();
  }
}

module.exports = new StandupJob();

const { CronJob } = require('cron');
const Sheets = require('../../sheets/index.js');
const autoBind = require('auto-bind');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

class StandupJob {
  constructor(bot) {
    this.bot = bot;
    this.job = new CronJob({
      cronTime: '00 * 9 * * *',
      onTick: () => { return this.chooseFacilitator(); },
      start: false
    });

    autoBind(this);
  }

  chooseOne(users) {
    console.log('***', users);
    const candidates = users.filter((user) => { return user.standup.participating; });
    const n = Math.min(...candidates.map((user) => { return user.standup.count; }));
    // filter out the users with the lowest count
    const victims = candidates.filter((user) => {
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
        sheets.push({
          channel: sheet.split('_')[0],
          sheetName: sheet
        });
      });

      return Promise.all(sheetsToFetch.map((sheet) => { return Sheets.listUsers(sheet); }));
    })
    .then((users) => {
      const facilitators = users.map(this.chooseOne);
      for (let i = 0; i < sheets.length; i += 1) {
        sheets[i].facilitator = facilitators[i];
      }

      // TODO
      // increment count
      for (let i = 0; i < sheets.length; i += 1) {
        const facilitator = users[i].find((user) => {
          return user.id === sheets[i].facilitator.id;
        });
        if (facilitator) {
          facilitator.standup.count += 1;
        }
      }
      // sheets.forEach((sheet) => {
      //   users.forEach((userList) => {
      //     const facilitator = userList.find((user) => {
      //       return user.id === sheet.facilitator.id;
      //     });
      //     if (facilitator) {
      //       facilitator.standup.count += 1;
      //     }
      //   });
      // });

      // update the sheets
      return Promise.all(users.map((userList, index) => {
        return Sheets.updateSheetValues(userList, userList.length, sheets[index].sheetName);
      }));
    })
    .then(() => {
      // announce to channel
      sheets.forEach((sheet) => {
        const message = `Good morning! For today's standup, <@${sheet.facilitator.id}> will be facilitating!`;
        this.bot.announceToChannel(sheet.channel, message);
      });
    });
  }

  start() {
    pino.info('Starting facilitator job');
    this.job.start();
  }
}

module.exports = StandupJob;

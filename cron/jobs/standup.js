const { CronJob } = require('cron');
const Sheets = require('../../sheets/index.js');
const autoBind = require('auto-bind');
const moment = require('moment');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

const excludedSheets = ['holidays'];

const fetchSheets = () => {
  return Sheets.getSpreadsheetDetails()
  .then((result) => {
    // Get all sheets from the spreadsheet
    const sheets = [];
    const sheetsToFetch = result.data.sheets.filter((sheetData) => {
      return !excludedSheets.includes(sheetData.properties.title);
    }).map((sheetData) => {
      return sheetData.properties.title;
    });
    sheetsToFetch.forEach((sheet) => {
      sheets.push({
        channel: sheet.split('_')[0],
        sheetName: sheet
      });
    });

    return Promise.resolve({ sheets, sheetsToFetch });
  });
};

class StandupJob {
  constructor(bot) {
    this.bot = bot;
    this.job = new CronJob({
      cronTime: '00 * * * * *',
      onTick: () => { return this.run(); },
      start: false
    });

    autoBind(this);
  }

  chooseOne(users) {
    const candidates = users.filter((user) => { return user.standup.participating; });
    const n = Math.min(...candidates.map((user) => { return user.standup.count; }));
    // filter out the users with the lowest count
    const victims = candidates.filter((user) => {
      return user.standup.count === n;
    });
    // return the victim
    return victims[Math.floor(Math.random() * victims.length)];
  }

  run() {
    // first check if today is a holiday
    let currentHoliday;
    Sheets.listHolidays()
    .then((holidays) => {
      const today = moment().format('YYYY-MM-DD');
      currentHoliday = holidays.find((holiday) => {
        return moment(holiday.date).isSame(today);
      });

      return fetchSheets();
    })
    .then(({ sheets, sheetsToFetch }) => {
      if (currentHoliday) {
        sheets.forEach((sheet) => {
          const message = `Good morning! Today is a holiday (${currentHoliday.holiday}) and there will be no standup.`;
          this.bot.announceToChannel(sheet.channel, message);
        });
        return Promise.resolve();
      }
      return this.chooseFacilitator({ sheets, sheetsToFetch });
    });
  }

  chooseFacilitator({ sheets, sheetsToFetch }) {
    pino.info('Choosing facilitator for standup');
    Promise.all(sheetsToFetch.map((sheet) => { return Sheets.listUsers(sheet); }))
    .then((users) => {
      const facilitators = users.map(this.chooseOne);
      for (let i = 0; i < sheets.length; i += 1) {
        sheets[i].facilitator = facilitators[i]; // eslint-disable-line no-param-reassign
      }

      // increment count
      for (let i = 0; i < sheets.length; i += 1) {
        const facilitator = users[i].find((user) => {
          return user.id === sheets[i].facilitator.id;
        });
        if (facilitator) {
          facilitator.standup.count += 1;
        }
      }

      // update the sheets
      return Promise.all(users.map((userList, index) => {
        return Sheets.updateSheetValues(userList, userList.length, sheets[index].sheetName);
      }));
    })
    .then(() => {
      // announce to channel
      sheets.filter((sheet) => {
        return sheet.facilitator;
      }).forEach((sheet) => {
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

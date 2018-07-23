const { google } = require('googleapis');
const Client = require('../client.js');
const autoBind = require('auto-bind');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

const utils = require('./utils/index.js');

const SHEET_ID = process.env.SHEETS_ID;
const VERSION = 'v4';

const buildRanges = (rowNumber, sheetName) => {
  const ranges = [];
  for (let i = 1; i <= rowNumber; i += 1) {
    ranges.push([`${sheetName}!A${i}:G`]);
  }
  return ranges;
};

class Sheets {
  constructor() {
    // const auth = Client.getClient();
    // this.client = auth;
    autoBind(this);
  }

  listUsers(sheetName) {
    pino.info(`Fetching users for sheet ${sheetName}`);
    return new Promise((resolve, reject) => {
      const sheets = google.sheets({
        version: VERSION,
        auth: Client.getClient()
      });
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A2:G`
      }, (err, { data }) => {
        if (err) { reject(err); }
        const result = data.values || [];
        resolve(utils.users.format(result));
      });
    });
  }

  listHolidays() {
    return new Promise((resolve, reject) => {
      const sheets = google.sheets({
        version: VERSION,
        auth: Client.getClient()
      });

      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'holidays!A2:B'
      }, (err, { data }) => {
        if (err) { reject(err); }
        const result = data.values || [];
        resolve(utils.holidays.format(result));
      });
    });
  }

  clearSheetValues(rowNumber, sheetName) {
    return new Promise((resolve, reject) => {
      const sheets = google.sheets({
        version: VERSION,
        auth: Client.getClient()
      });
      sheets.spreadsheets.values.batchClear({
        spreadsheetId: SHEET_ID,
        resource: {
          ranges: buildRanges(rowNumber, sheetName)
        }
      }, (err, response) => {
        if (err) { reject(err); }
        resolve(response);
      });
    });
  }

  updateSheetValues(facilitators, rowNumber, sheetName) {
    const header = ['Slack ID', 'Slack name', 'Real name', 'Standup Facilitator', 'Count', 'Retro Facilitator', 'Count'];
    const sheets = google.sheets({
      version: VERSION,
      auth: Client.getClient()
    });
    this.clearSheetValues(rowNumber, sheetName)
    .then(() => {
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1:G`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [header].concat(utils.users.rebuild(facilitators))
        }
      }, (err, result) => {
        if (err) { return console.log(`The API returned an error: ${err}`); }
        console.log('%d cells updated.', result.updatedCells);
      });
    })
    .catch((err) => {
      pino.error(err);
    });
  }

  getSpreadsheetDetails() {
    pino.info('Getting spreadsheet metadata');
    const request = {
      spreadsheetId: SHEET_ID,
      ranges: [],
      includeGridData: false,
      auth: Client.getClient()
    };
    const sheets = google.sheets(VERSION);
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.get(request, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  addNewSheet(channel) {
    pino.info('Attempting to create a sheet');
    const request = {
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: `${channel.id}_${channel.name}`
              }
            }
          }
        ]
      }
    };
    const sheets = google.sheets({ version: VERSION, auth: Client.getClient() });
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.batchUpdate(request, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  deleteSheet(sheetId) {
    pino.info('Attempting to delete a sheet');
    const request = {
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            deleteSheet: {
              sheetId
            }
          }
        ]
      }
    };
    const sheets = google.sheets({ version: VERSION, auth: Client.getClient() });
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.batchUpdate(request, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}

module.exports = new Sheets();

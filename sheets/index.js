const { google } = require('googleapis');
const Client = require('../client.js');
const autoBind = require('auto-bind');
const pino = require('pino')();

const SHEET_ID = process.env.SHEETS_ID;
const VERSION = 'v4';

class Sheets {
  constructor() {
    // const auth = Client.getClient();
    // this.client = auth;
    autoBind(this);
  }

  listUsers() {
    const sheets = google.sheets({ version: VERSION, auth: this.client });
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Moose!A2:B'
    }, (err, { data }) => {
      if (err) { return console.log(`The API returned an error: ${err}`); }
      const rows = data.values;
      if (rows.length) {
        console.log('Name, Major:');
        // Print columns A and E, which correspond to indices 0 and 4.
        rows.map((row) => {
          console.log(`${row[0]}, ${row[1]}`);
        });
      } else {
        console.log('No data found.');
      }
    });
  }

  addUser() {
    const sheets = google.sheets({ version: VERSION, auth: this.client });
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Moose!A4:B',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          ['@Kyle', 'Kyle']
        ]
      }
    }, (err, result) => {
      if (err) { return console.log(`The API returned an error: ${err}`); }
      console.log('%d cells updated.', result.updatedCells);
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
                title: channel.id
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

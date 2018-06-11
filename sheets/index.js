const { google } = require('googleapis');
const Client = require('../client.js');
const autoBind = require('auto-bind');

const SHEET_ID = process.env.SHEETS_ID;

class Sheets {
  constructor() {
    // const auth = Client.getClient();
    // this.client = auth;
    autoBind(this);
  }

  listUsers() {
    const sheets = google.sheets({ version: 'v4', auth: this.client });
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
    const sheets = google.sheets({ version: 'v4', auth: this.client });
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

  addNewSheet(channel) {
    console.log('here', channel);
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
    const sheets = google.sheets({ version: 'v4', auth: Client.getClient() });
    sheets.spreadsheets.batchUpdate(request, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(res);
    });
  }
}

module.exports = new Sheets();

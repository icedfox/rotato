const { google } = require('googleapis');
const Client = require('../client.js');

const SHEET_ID = process.env.SHEETS_ID;

function listUsers() {
  const sheets = google.sheets({ version: 'v4', auth: Client.getClient() });
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

function addUser() {
  const auth = Client.getClient();
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Moose!A4:B',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        ['@test', 'test']
      ]
    }
  }, (err, result) => {
    if (err) { return console.log(`The API returned an error: ${err}`); }
    console.log('%d cells updated.', result.updatedCells);
  });
}

Client.authorize()
  .then(() => {
    addUser();
  })
  .catch((err) => {
    console.log('Error happened', err);
  });

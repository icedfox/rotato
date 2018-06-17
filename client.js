const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const autoBind = require('auto-bind');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'credentials.json';

class Client {
  constructor() {
    this.oAuth2Client = null;
    this.content = null;

    autoBind(this);
  }

  authorize() {
    return this.getCredentials()
      .then((credentials) => {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        return this.setCredentials();
      });
  }

  getCredentials() {
    // Load client secrets from a local file.
    return new Promise((resolve, reject) => {
      fs.readFile('client_secret.json', (err, content) => {
        if (err) {
          console.log('Error loading client secret file:', err);
          reject(err);
        }
        // Authorize a client with credentials, then call the Google Sheets API.
        resolve(JSON.parse(content));
      });
    });
  }

  setCredentials() {
    return new Promise((resolve) => {
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          return this.getNewToken();
        }
        this.oAuth2Client.setCredentials(JSON.parse(token));
        resolve();
      });
    });
  }

  getNewToken() {
    return new Promise((resolve, reject) => {
      const authUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        this.oAuth2Client.getToken(code, (err, token) => {
          if (err) { reject(err); }
          this.oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) { reject(err); }
            console.log('Token stored to', TOKEN_PATH);
            resolve();
          });
        });
      });
    });
  }

  getClient() {
    return this.oAuth2Client;
  }
}

module.exports = new Client();

const autoBind = require('auto-bind');
const Sheets = require('../../sheets');
const pino = require('pino')();

class EventListener {
  constructor({ rtm, channels }) {
    this.rtm = rtm;
    this.channels = channels;
    autoBind(this);
  }

  /*
    Sample:
    { type: 'channel_left',
  channel: 'CB44H0HJL',
  actor_id: 'U4M6C1GDC',
  event_ts: '1528981531.000521' }
   */
  createListener() {
    // Rotato got invited to a new channel
    this.rtm.on('channel_left', (event) => {
      pino.info('Event triggered: channel_left', event);
      if (this.channels && this.channels.length > 0) {
        // remove the channel from the channels list
        this.channels = this.channels.filter((channel) => { return event.channel !== channel.id; });
        // remove the channel from the spreadsheet
        Sheets.getSpreadsheetDetails()
        .then((response) => {
          const sheetDetails = response.data.sheets.find((sheet) => {
            return sheet.properties.title === event.channel;
          });
          pino.info('Got spreadSheetDetails', sheetDetails);
          if (sheetDetails) {
            pino.info('sheetDetails', sheetDetails);
            return Sheets.deleteSheet(sheetDetails.properties.sheetId);
          }
          return Promise.reject(new Error('Sheet not found'));
        })
        .then(() => {
          pino.info('Sheet deleted');
        })
        .catch((err) => {
          pino.error('Failed to delete sheet', err);
        });
      }
    });
  }
}

module.exports = EventListener;

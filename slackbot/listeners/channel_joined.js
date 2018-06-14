const autoBind = require('auto-bind');
const Sheets = require('../../sheets');
const pino = require('pino')();

class EventListener {
  constructor({ rtm, channels }) {
    this.rtm = rtm;
    this.channels = channels;
    autoBind(this);
  }

  createListener() {
    // Rotato got invited to a new channel
    this.rtm.on('channel_joined', (event) => {
      pino.info('Event triggered: channel_joined', event);
      if (this.channels && this.channels.length > 0) {
        const isAlreadyInSlackChannel = this.channels.find((channel) => { return event.channel.id === channel.id; });
        if (!isAlreadyInSlackChannel) {
          Sheets.getSpreadsheetDetails()
            .then((response) => {
              const hasASheet = response.data.sheets.find((sheet) => {
                return sheet.properties.title === event.channel.id;
              });
              pino.info('got spreadSheetDetails');
              if (hasASheet) {
                pino.error('Already has a sheet');
              } else {
                Sheets.addNewSheet(event.channel);
              }
            })
            .catch((err) => {
              pino.error(err);
            });
        } else {
          pino.error('already in channel');
        }
      }
    });
  }
}

module.exports = EventListener;

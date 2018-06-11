const autoBind = require('auto-bind');
const Sheets = require('../../sheets');

class EventListener {
  constructor({ rtm }) {
    this.rtm = rtm;
    autoBind(this);
  }

  createListener() {
    // Rotato got invited to a new channel
    this.rtm.on('channel_joined', (event) => {
      Sheets.addNewSheet(event.channel);
      console.log('channel_joined triggered', event);
    });
  }
}

module.exports = EventListener;

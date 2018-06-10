const autoBind = require('auto-bind');

class EventListener {
  constructor({ rtm }) {
    this.rtm = rtm;
    autoBind(this);
  }

  createListener() {
    // Rotato got invited to a new channel
    this.rtm.on('channel_joined', (event) => {
      console.log('channel_joined triggered', event);
    });
  }
}

module.exports = EventListener;

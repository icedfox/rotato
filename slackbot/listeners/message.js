const autoBind = require('auto-bind');

class EventListener {
  constructor({ rtm, channels }) {
    this.rtm = rtm;
    this.channels = channels;
    autoBind(this);
  }

  createListener() {
    // Rotato got invited to a new channel
    this.rtm.on('message', (event) => {
      console.log('event', event);
      // For structure of `event`, see https://api.slack.com/events/message/channel_name
      // console.log(`A channel was renamed from ${message.old_name} to ${message.name}`);
    });
  }
}

module.exports = EventListener;

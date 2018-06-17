const autoBind = require('auto-bind');
const pino = require('pino')();

class EventListener {
  constructor({ rtm, channels }) {
    this.rtm = rtm;
    this.channels = channels;
    autoBind(this);
  }

  /*
    Sample
    { type: 'message',
    user: 'U4M6C1GDC',
    text: 'Rotato bro',
    client_msg_id: '03e915dd-8474-4d88-82d6-edc849ae6fc7',
    team: 'T4KR7KXFB',
    channel: 'CB44H0HJL',
    event_ts: '1528982920.000253',
    ts: '1528982920.000253' }
   */
  createListener() {
    // Rotato is listening for messages in all the channels he joined
    this.rtm.on('message', (event) => {
      console.log('*** rtm', this.rtm);
      // console.log('message', event);
      const words = event.text.split(' ');
      // For structure of `event`, see https://api.slack.com/events/message/channel_name
      // console.log(`A channel was renamed from ${message.old_name} to ${message.name}`);
    });
  }
}

module.exports = EventListener;

const autoBind = require('auto-bind');
const pino = require('pino')();

// commands
const help = require('../commands/help.js');
const addUser = require('../commands/add.js');
const removeUser = require('../commands/remove.js');

const regex = /<@(.*?)>/g;
const isValidId = (str) => {
  return str.match(regex);
};

class EventListener {
  constructor({
    rtm, channels, bot, users
  }) {
    this.rtm = rtm;
    this.bot = bot;
    this.users = users;
    this.channels = channels;
    autoBind(this);
  }

  findUser(targetId) {
    const cleanId = regex.exec(targetId)[1];
    return this.users.find((user) => {
      return user.id === cleanId;
    });
  }

  add(words, eventChannel) {
    if (eventChannel && isValidId(words[2])) {
      const targetUser = this.findUser(words[2]);
      addUser(targetUser, `${eventChannel.id}_${eventChannel.name}`)
      .then((response) => {
        if (response.userExists) {
          return this.rtm.sendMessage(`${response.user[2]} is already a facilitator`, eventChannel.id);
        }
        return response;
      })
      .catch((err) => {
        pino.error({});
      });
    }
  }

  remove(words, eventChannel) {
    if (eventChannel && isValidId(words[2])) {
      const targetUser = this.findUser(words[2]);
      removeUser(targetUser.id, `${eventChannel.id}_${eventChannel.name}`)
      .then((response) => {
        if (!response.userExists) {
          return this.rtm.sendMessage(`${targetUser.real_name} is not a facilitator`, eventChannel.id);
        }
        return response;
      })
      .catch((err) => {
        pino.error({});
      });
    }
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
  /*
    Format: @Rotato <command> <argument1> <argument2> <argument3>
   */
  createListener() {
    // Rotato is listening for messages in all the channels he joined
    this.rtm.on('message', (event) => {
      if (event.text.includes(this.bot.id)) {
        const eventChannel = this.channels.find((channel) => {
          return channel.id === event.channel;
        });
        const words = event.text.split(' ');
        switch (words[1]) {
          case 'help':
            help(this.rtm, event.channel);
            break;
          case 'add':
            this.add(words, eventChannel);
            break;
          case 'remove':
            this.remove(words, eventChannel);
            break;
          default:
            break;
        }
      }
      // For structure of `event`, see https://api.slack.com/events/message/channel_name
      // console.log(`A channel was renamed from ${message.old_name} to ${message.name}`);
    });
  }
}

module.exports = EventListener;

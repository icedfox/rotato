const path = require('path');
const fs = require('fs');
const autoBind = require('auto-bind');
// const { WebClient } = require('@slack/client');
const { RTMClient, WebClient } = require('@slack/client');
// const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const token = process.env.SLACK_TBO_TOKEN;

class SlackBot {
  constructor() {
    // create a bot
    this.client = {};
    this.client.web = new WebClient(token);
    this.client.rtm = new RTMClient(token);
    this.client.rtm.start();

    // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
    // const conversationId = 'C4M6C1J4W';

    // The RTM client can send simple string messages
    //
    // this.announceToChannel();
    this.findChannels();
    // this.initListeners();

    autoBind(this);
  }

  initListeners() {
    fs.readdirSync(path.resolve(__dirname, 'listeners')).forEach((file) => {
      const Listener = require(path.resolve(__dirname, 'listeners', file)); //eslint-disable-line
      const Event = new Listener(this.client);
      Event.createListener();
    });
  }

  findChannels() {
    this.client.web.channels.list()
      .then((res) => {
      // Take any channel for which the bot is a member
        const channels = res.channels.filter((c) => {
          return c.is_member;
        }).map((c) => {
          return {
            id: c.id,
            name: c.name,
            users: c.members
          };
        });
        console.log('Rotato is a member of ', channels);

        if (channels.length > 0) {
          this.client.channels = channels;
          this.initListeners();
        // We now have a channel ID to post a message in!
        // use the `sendMessage()` method to send a simple string to a channel using the channel ID
          // this.client.rtm.sendMessage('Hello, world!', this.channels[0].id)
          // Returns a promise that resolves when the message is sent
          // .then((msg) => { return console.log(`Message sent to channel ${this.channels[0].name} with ts:${msg.ts}`); })
          // .catch(console.error);
        } else {
          console.log('This bot does not belong to any channel, invite it to at least one and try again');
        }
      });
  }

  announceToChannel() {
    this.client.web.chat.postMessage({
      channel: 'roboto-test',
      text: 'Hello there',
      as_user: true
    })
      .then((res) => {
      // `res` contains information about the posted message
        console.log('Message sent: ', res.ts);
      })
      .catch(console.error);
  }
}

module.exports = new SlackBot();

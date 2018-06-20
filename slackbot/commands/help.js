module.exports = (rtm, channelId) => {
  const helpMessage = `Hi there, I'm Rotato, the bot that rotates meeting facilitators!
  You can interact with me by giving me commands from the following list: [help, add, remove].
  Here's how to use them:
  Add a new user: \`@Rotato add @user\`
  Remove a user: \`@Rotato remove @user\`
  `;
  rtm.sendMessage(helpMessage, channelId)
  // Returns a promise that resolves when the message is sent
    .then((msg) => { return console.log('Message sent to channel'); })
    .catch(console.error);
};

const Sheets = require('../../sheets/index.js');
const pino = require('pino')();

module.exports = (user, sheetName) => {
  const {
    id,
    name,
    real_name: realName
  } = user;
  return Sheets.listUsers(sheetName)
  .then((rows) => {
    /*
    [ [ 'UB6SU7R1N', 'lisa.wagner', 'Lisa', 'yes' ] ]
     */
    // Check if the user already exists in the list
    const existingUser = rows.find((facilitator) => {
      return facilitator.id === id;
    });
    if (existingUser) {
      // Send the user's info back
      return Promise.resolve({
        userExists: true,
        user: existingUser
      });
    }
    // add the user to the list, and send the list back
    const facilitators = rows;
    let minStandupCount = 0;
    let minRetroCount = 0;
    if (facilitators.length > 0) {
      minStandupCount = Math.min(...facilitators.map((facilitator) => {
        return facilitator.standup.count ? parseInt(facilitator.standup.count, 10) : 0;
      }));
      minRetroCount = Math.min(...facilitators.map((facilitator) => {
        return facilitator.retro.count ? parseInt(facilitator.retro.count, 10) : 0;
      }));
    }
    facilitators.push({
      id,
      alias: name,
      realName,
      standup: {
        participating: true,
        count: minStandupCount
      },
      retro: {
        participating: false,
        count: minRetroCount
      }
    });
    return Sheets.updateSheetValues(facilitators, rows.length, sheetName);
  });
};

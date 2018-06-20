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
        return facilitator.includes(id);
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
      facilitators.push([id, name, realName, 'yes']);
      return Sheets.updateSheetValues(facilitators, rows.length, sheetName);
    });
};

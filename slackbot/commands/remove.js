const Sheets = require('../../sheets/index.js');
const pino = require('pino')();

module.exports = (userId, sheetName) => {
  return Sheets.listUsers(sheetName)
    .then((rows) => {
      /*
      [ [ 'UB6SU7R1N', 'lisa.wagner', 'Lisa', 'yes' ] ]
       */
      // Check if the user already exists in the list
      const existingUser = rows.find((facilitator) => {
        return facilitator.id === userId;
      });
      if (!existingUser) {
        // The user doesn't exist
        return Promise.resolve({
          userExists: false
        });
      }
      // remove the user from the list
      const facilitators = rows.filter((facilitator) => {
        return facilitator.id !== userId;
      });
      return Sheets.updateSheetValues(facilitators, rows.length, sheetName);
    });
};

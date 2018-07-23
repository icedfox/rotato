const { formatUsers, rebuildUsers } = require('./users.js');
const { formatHolidays } = require('./holidays.js');

module.exports = {
  users: {
    format: formatUsers,
    rebuild: rebuildUsers
  },
  holidays: {
    format: formatHolidays
  }
};

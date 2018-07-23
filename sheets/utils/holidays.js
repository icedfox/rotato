const formatHolidays = (holidays) => {
  return holidays.map((holiday) => {
    return {
      holiday: holiday[0],
      date: `${holiday[1]}`
    };
  });
};

module.exports = {
  formatHolidays
};

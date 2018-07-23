const formatUsers = (users) => {
  return users.map((user) => {
    return {
      id: user[0],
      alias: user[1],
      realName: user[2],
      standup: {
        participating: user[3] === 'yes',
        count: parseInt(user[4], 10)
      },
      retro: {
        participating: user[5] === 'yes',
        count: parseInt(user[6], 10)
      }
    };
  });
};

const rebuildUsers = (users) => {
  return users.map((user) => {
    return [
      user.id,
      user.alias,
      user.realName,
      user.standup.participating ? 'yes' : 'no',
      user.standup.count,
      user.retro.participating ? 'yes' : 'no',
      user.retro.count
    ];
  });
};

module.exports = {
  formatUsers,
  rebuildUsers
};

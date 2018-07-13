const autoBind = require('auto-bind');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

class Cron {
  constructor(bot) {
    this.jobs = ['standup'];
    this.bot = bot;

    autoBind(this);
  }

  startJobs() {
    this.jobs.forEach((jobName) => {
      const Job = require(`./jobs/${jobName}.js`); // eslint-disable-line
      const job = new Job(this.bot);
      job.start();
    });

    pino.info('Cron jobs have started');
  }
}

module.exports = Cron;

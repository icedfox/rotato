const autoBind = require('auto-bind');
const pino = require('pino')({
  prettyPrint: { colorize: true }
});

class Cron {
  constructor() {
    this.jobs = ['standup'];

    autoBind(this);
  }

  startJobs() {
    this.jobs.forEach((jobName) => {
      const job = require(`./jobs/${jobName}.js`); // eslint-disable-line
      // const job = new Job();
      job.start();
    });

    pino.info('Cron jobs have started');
  }
}

module.exports = new Cron();

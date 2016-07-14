var CronJobManager = require('./crontab_manager.js');
var manager = new CronJobManager();
var exec = require('child_process').exec;
var cron = require('./cron.json'), fs    = require('fs')
var env = require('../../_config/env.json');

for (var i = 0; i < cron.length; i++) {
	var f = function(v) {
		return function() {
			if (global.gc) {
				console.log('===>running GC1');
				global.gc();
			} 
			exec('cd ' + env.APPLICATION_DIRECTORY + '/_master &&  ' + v, function(error, stdout, stderr) {
				console.log('running cd ' + env.APPLICATION_DIRECTORY + '/_master && ' + v);
				if (global.gc) {
					console.log('===>running GC2');
					global.gc();
				}
			});
		}
	};
	if (manager.exists( cron[i]['id'])) {
		manager.stop( cron[i]['id']);
	}
	if (cron[i].script) {
		if (!manager.exists( cron[i]['id'])) {
			
			manager.add( cron[i]['id'], cron[i]['schedule'], f(cron[i].script), null, false, "America/Los_Angeles");
		} else {
			manager.deleteJob( cron[i]['id']);
		}
		manager.start( cron[i]['id']);
	}	
}

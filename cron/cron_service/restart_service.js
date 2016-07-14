var fs    = require('fs');
var exec = require('child_process').exec;
var env	= require('../../../_config/env.json');

var _restart = function(){
	var vhost_cfg ={N:{},P:{}};
	if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/vhost_list.json')){
		vhost_cfg 	= 	require(env.APPLICATION_DIRECTORY + '/_config/vhost_list.json');
	}		

	
	exec(env.APPLICATION_DIRECTORY  + '/_master/node_modules/forever/bin/forever stopall && /etc/init.d/qalet_cron start', function(err, out, code) {
		exec(
			'/etc/init.d/qalet_admin start && ' + 
			'/etc/init.d/qalet_cdn start && ' + 
			'/etc/init.d/qalet_ws start && ' + 
			'/etc/init.d/qalet_http start'
			, function(err, out, code) {
				
				for(var key in vhost_cfg.N) {
					if (fs.existsSync('/etc/init.d/qalet_V_' + key)){
						exec('/etc/init.d/qalet_V_' + key + ' start', function(err, out, code) {
							console.log(out);
						});
					}
				}				
				console.log(out);
		});	
	});


}
if (!fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/restart_stop.txt')){
	if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/restart_stamp.txt')){
		fs.unlinkSync(env.APPLICATION_DIRECTORY + '/_config/restart_stamp.txt');
		_restart();
	}
}
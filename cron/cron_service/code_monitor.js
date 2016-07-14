var fs    = require('fs');
var net = require('net');
var exec = require('child_process').exec;
var env			= 	require('../../../_config/env.json');

var _code_monitor = function() {
//	var fs    = require('fs');
//	var exec = require('child_process').exec;
//	var env	= require('../../../_config/env.json');

	var code_list = [
		env.APPLICATION_DIRECTORY+'/_master/qalet_master.js',	
		env.APPLICATION_DIRECTORY+'/_master/qalet_vhost.js',	
		env.APPLICATION_DIRECTORY+'/_master/vhost_inc.js',	
		env.APPLICATION_DIRECTORY+'/_master/qalet_master_config.json',	
		env.APPLICATION_DIRECTORY+'/_master/log_inc.js'
	];
	var code_sts = {};

	if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/code_sts.json')){
		code_sts = require(env.APPLICATION_DIRECTORY + '/_config/code_sts.json');
	}	
	var cmd = 0;

	for (var i=0; i < code_list.length; i++) {
		if (!fs.existsSync(code_list[i])){
			continue;
		}
		var t = fs.statSync(code_list[i]);
		t.mtime = t.mtime.toString()
		if (code_sts[code_list[i]] != t.mtime) {
			cmd = 1; 
			code_sts[code_list[i]] = t.mtime;
		} 
	}

	fs.writeFileSync(env.APPLICATION_DIRECTORY + '/_config/code_sts.json', JSON.stringify(code_sts));

	if(cmd) {
		fs.writeFileSync(env.APPLICATION_DIRECTORY + '/_config/restart_stamp.txt', new Date().getTime());
	}
};

_code_monitor();

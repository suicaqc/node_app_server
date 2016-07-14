var fs    = require('fs');
var exec = require('child_process').exec;
var env	= require('../../../_config/env.json');

var _restart = function(cmd){
	fs.unlink(env.APPLICATION_DIRECTORY + '/_config/user_command.data',
		function(err) {
			if (!err) {
				
				exec(cmd, function(err, out, code) {
					console.log(err);
					console.log(out);
					console.log(code);
				});				
			} else {
				console,log(err);
			}
		}
	)
}	
fs.readFile(env.APPLICATION_DIRECTORY + '/_config/user_command.data', function read(err, data) {
    if (!err) {
         _restart(data);
    }
});	
	



var exec = require('child_process').exec;
var fs    = require('fs');


console.log('Start install npm ...');
exec(
	'sudo apt-get -y install npm && npm install forever -g '
	, function(error, stdout, stderr) {
		console.log(error);
	_f();
});		

var _f = function() {
	exec("rm /etc/init.d/qalet_*", function(error, stdout, stderr) {	
		exec("update-rc.d -f 'qalet_*' remove",
			function(error, stdout, stderr){
				// Start Build
				var bufA = fs.readFileSync(cfg.APPLICATION_DIRECTORY+'/script_template/node_http' , "utf8");	
				
				fs.writeFileSync('/etc/init.d/qalet_cache', 
					bufA.replace(/{\$APPLICATION_DIRECTORY}/, __dirname).
						replace(/{\$APPLICATION_START}/, 'qalet_cache.js').
						replace(/{\$APPLICATION_NAME}/, 'qalet_cache').
						replace(/{\$APPLICATION_CODE}/, 'qalet_cache')
					);	
				exec('chmod +x /etc/init.d/qalet_cache');
				exec('update-rc.d qalet_cache defaults');				
						
				console.log('Build done. Need reboot ');
			//	exec('reboot');
			}
		);		
		
	});
		
	
}

	
	





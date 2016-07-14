var fs    = require('fs');
var exec = require('child_process').exec;

var env			= 	require('../../../_config/env.json');
var master_cfg 	= 	require('../../qalet_master_config.json');

var config_status 	= 	{};
if (fs.existsSync(env.APPLICATION_DIRECTORY+'/_config/config_status.json')){
	delete require.cache[env.APPLICATION_DIRECTORY+'/_config/config_status.json'];
	config_status 	= 	require(env.APPLICATION_DIRECTORY+'/_config/config_status.json');
} 

var cfg ={};

if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/vhost_list.json')){
	delete require.cache[env.APPLICATION_DIRECTORY + '/_config/vhost_list.json'];
	cfg.vhost 	= 	require(env.APPLICATION_DIRECTORY + '/_config/vhost_list.json');
} 



if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/router_cfg.json')){
	delete require.cache[env.APPLICATION_DIRECTORY + '/_config/router_cfg.json'];
	cfg.router 	= 	require(env.APPLICATION_DIRECTORY + '/_config/router_cfg.json');
} 

if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_vhost_config/vhost_debug.json')){
	delete require.cache[env.APPLICATION_DIRECTORY + '/_vhost_config/vhost_debug.json'];
	cfg.debug 	= 	require(env.APPLICATION_DIRECTORY + '/_vhost_config/vhost_debug.json');
} 


var _fvhost = function() {
	var vhost_cfg ={N:{},P:{}};
	if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/vhost_list.json')){
		vhost_cfg 	= 	require(env.APPLICATION_DIRECTORY + '/_config/vhost_list.json');
	}

	var vhost_local ={};
	if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/vhost_local.json')){
		vhost_local	= 	require(env.APPLICATION_DIRECTORY + '/_config/vhost_local.json');
	}

//	console.log('--Running vhost service ...');

	exec("rm /etc/init.d/qalet_V_*",
		function() {
			exec("update-rc.d -f 'qalet_V_*' remove",
				function(error, stdout, stderr){
					// Start Build
					var bufA = fs.readFileSync(env.APPLICATION_DIRECTORY+'/script_template/node_http' , "utf8");	
					
					var port = master_cfg.localport;
					console.log(vhost_cfg.N);
					for(var key in vhost_cfg.N) {
						if (!vhost_local[key]) continue;
						
						if (!vhost_cfg.N[key]['independent']) {
							port++;
							fs.writeFileSync('/etc/init.d/qalet_V_'+key, 
								bufA.replace(/{\$APPLICATION_DIRECTORY}/, env.APPLICATION_DIRECTORY+'/_master').
								replace(/{\$NODE_PATH}/g, env.APPLICATION_DIRECTORY).
								replace(/{\$APPLICATION_START}/, 'qalet_vhost.js '+ vhost_cfg.N[key].port).
								replace(/{\$APPLICATION_NAME}/, 'qalet_'+key).
								replace(/{\$APPLICATION_CODE}/, 'qalet_'+key)
							);						
						} else {
							
							fs.writeFileSync('/etc/init.d/qalet_V_'+key, 
								bufA.replace(/{\$APPLICATION_DIRECTORY}/, env.APPLICATION_DIRECTORY+'/_vhost/'+key).
								replace(/{\$NODE_PATH}/g, env.APPLICATION_DIRECTORY).
								replace(/{\$APPLICATION_START}/, vhost_cfg.N[key]['independent'].start_command).
								replace(/{\$APPLICATION_NAME}/, 'qalet_'+key).
								replace(/{\$APPLICATION_CODE}/, 'qalet_'+key)
							);							
							
						}
		
						var _f = function(key) {
							var n_key = key;
							return function() {
								exec('update-rc.d qalet_V_'+n_key+' defaults', function() {	
								});								
								
							}
						}
						exec('chmod +x /etc/init.d/qalet_V_'+key, _f(key));
			
					}
				}
			);
		}

	);	
	
}

if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/restart_stop.txt')){
	fs.unlinkSync(env.APPLICATION_DIRECTORY + '/_config/restart_stop.txt');
}

if (JSON.stringify(config_status) != JSON.stringify(cfg)) {
	fs.writeFileSync(env.APPLICATION_DIRECTORY + '/_config/config_status.json', JSON.stringify(cfg));
	
	fs.writeFileSync(env.APPLICATION_DIRECTORY + '/_config/restart_stop.txt', new Date().getTime());
	
	exec('rm -fr '+env.APPLICATION_DIRECTORY+'/_vhost', function() {
		_fvhost();	
		setTimeout(
			function() {
				fs.writeFileSync(env.APPLICATION_DIRECTORY + '/_config/restart_stamp.txt', new Date().getTime());
				if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/restart_stop.txt')){
					fs.unlinkSync(env.APPLICATION_DIRECTORY + '/_config/restart_stop.txt');
				}				
			},
			40000
		);	
	});
}
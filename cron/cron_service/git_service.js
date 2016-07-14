var fs    = require('fs');
var net = require('net');
var exec = require('child_process').exec;
var env			= 	require('../../../_config/env.json');


var dns = require('dns');
 


var _updateConfig = function() {
	var master_cfg 	= 	require('../../qalet_master_config.json');
	var _vhost_cfg 	= 	require('../../../_vhost_config/vhost.json');
	var router_cfg 	= 	{};

	var insideAddress = function(address) {
		var os = require( 'os' );
		var networkInterfaces = os.networkInterfaces( );		
		
		for (var o in networkInterfaces) {
			for (var i = 0; i <  networkInterfaces[o].length; i++) {
				if (networkInterfaces[o][i]['address']) {
					 if (!networkInterfaces[o][i]['internal']) {
						if (networkInterfaces[o][i]['address'] == address) return true; 
					 }

				}
			}
		}
		return false;
	} 
	


	if(!fs.existsSync(env.APPLICATION_DIRECTORY+'/_vhost')){
		fs.mkdirSync(env.APPLICATION_DIRECTORY+'/_vhost', 0766); 
	}

	if(!fs.existsSync(env.APPLICATION_DIRECTORY+'/_vhostCDN')){
		fs.mkdirSync(env.APPLICATION_DIRECTORY+'/_vhostCDN', 0766); 
	}

	var vhost_local ={};
	if (fs.existsSync(env.APPLICATION_DIRECTORY + '/_config/vhost_local.json')){
		vhost_local	= 	require(env.APPLICATION_DIRECTORY + '/_config/vhost_local.json');
	}

	var dns = require('dns');

	for (var i=0; i < _vhost_cfg.length; i++) {
		if (!_vhost_cfg[i]['link'] &&  !_vhost_cfg[i]['linkIP']) {
			if (_vhost_cfg[i]['port']) {
				var k = _vhost_cfg[i]['server']+'_'+_vhost_cfg[i]['port'];
				k = k.toLowerCase();
				// console.log(_vhost_cfg[i]['server']);
				var _f = function(idx) {
					var m = idx;
					return function (err, addresses) {
						if (!err) {
							for (var j = 0; j < addresses.length; j++) {
								if (insideAddress(addresses[j])) {
									vhost_local[m] = true;
									break;
								}
							}
							var fname = env.APPLICATION_DIRECTORY + '/_config/vhost_local.json';
							fs.writeFileSync(fname, JSON.stringify(vhost_local));					
						}
					}	
				};
				dns.resolve4(_vhost_cfg[i]['server'], _f(k));
			}		
		} 
	}

	for (var i=0; i < _vhost_cfg.length; i++) {
		if (_vhost_cfg[i]['linkIP']) {
			var ip_a = _vhost_cfg[i]['linkIP'].split(',');
			for (var j = 0; j < ip_a.length; j++) {
				if (insideAddress(ip_a[j])) {
					var k = _vhost_cfg[i]['server']+'_'+_vhost_cfg[i]['port'];
					k = k.toLowerCase();
					vhost_local[k] = true;
					var fname = env.APPLICATION_DIRECTORY + '/_config/vhost_local.json';
					fs.writeFileSync(fname, JSON.stringify(vhost_local));
				}
			}		
		} 
	}

	var vhost_cfg ={N:{},P:{}, ws:{}};

	for (var i=0; i < _vhost_cfg.length; i++) {
		if ((_vhost_cfg[i]['link']) || (_vhost_cfg[i]['linkIP'])) {
			var k = _vhost_cfg[i]['server']+'_'+_vhost_cfg[i]['port'];	
			k = k.toLowerCase();
			
			if (_vhost_cfg[i]['linkIP']) {
				var ip_a = _vhost_cfg[i]['linkIP'].split(','); 
				var includeLocal = false;
				for (var j = 0; j < ip_a.length; j++) {
					if (insideAddress(ip_a[j].replace(/^\s+|\s+$/gm,''))) {
						includeLocal = true;
					}
				}
				
				if (!includeLocal) {
					var h_a = [];
					for (var j = 0; j < ip_a.length; j++) {
						h_a[h_a.length] = 'http://' + ip_a[j].replace(/^\s+|\s+$/gm,'') +':'+_vhost_cfg[i]['linkPORT']
					}
					router_cfg[k] = {url:h_a, type:''};
				}
				
			} else {
				router_cfg[k] = {url:_vhost_cfg[i]['link'],type:(!_vhost_cfg[i]['type'])?'':_vhost_cfg[i]['type']};
			}
		}

	}

	for (var i=0; i < _vhost_cfg.length; i++) {
		
		if (!_vhost_cfg[i]['link'] && !_vhost_cfg[i]['linkIP']) {
			
			if (_vhost_cfg[i]['port']) {
				var k = _vhost_cfg[i]['server']+'_'+_vhost_cfg[i]['port'];
				
				k = k.toLowerCase();
				if (router_cfg[k]) continue;

				if (!_vhost_cfg[i]['independent']) {
					var p = master_cfg.localport + i + 1;
				} else {
					var p = (_vhost_cfg[i]['independent']['port'])?_vhost_cfg[i]['independent']['port']:(master_cfg.localport + i + 1);
					_vhost_cfg[i]['independent']['port'] = p;
				}
				vhost_cfg.N[k] = {port:p, git:_vhost_cfg[i]['git'], openChannel:(_vhost_cfg[i]['openChannel'])?_vhost_cfg[i]['openChannel']:'',  independent:(_vhost_cfg[i]['independent'])?_vhost_cfg[i]['independent']:''};
				vhost_cfg.P[p] = {key:k, git:_vhost_cfg[i]['git'], openChannel:(_vhost_cfg[i]['openChannel'])?_vhost_cfg[i]['openChannel']:'',  independent:(_vhost_cfg[i]['independent'])?_vhost_cfg[i]['independent']:''};

				if ((_vhost_cfg[i]['ws']) && (_vhost_cfg[i]['ws'].length)) {
					for (var w=0; w < _vhost_cfg[i]['ws'].length; w++) {
						vhost_cfg.ws[_vhost_cfg[i]['ws'][w]] = k;	
						var _f = function(k) {
							return function(err, addresses) {
								if (err) {}
								else if (insideAddress(addresses[0])) {
									vhost_local[k] = true;
									var fname = env.APPLICATION_DIRECTORY + '/_config/vhost_local.json';
									fs.writeFileSync(fname, JSON.stringify(vhost_local));										
								}	
							}
							
						}
						dns.resolve4(_vhost_cfg[i]['ws'][w], _f(k));	
					}
				}	
			}		
		} 
	}

	var fname = env.APPLICATION_DIRECTORY + '/_config/vhost_list.json';
	fs.writeFileSync(fname, JSON.stringify(vhost_cfg));

	var fname1 = env.APPLICATION_DIRECTORY + '/_config/router_cfg.json';
	fs.writeFileSync(fname1, JSON.stringify(router_cfg));

	var vhost_list 	= 	{N:{},P:{}, ws:{}};
	if (fs.existsSync(env.APPLICATION_DIRECTORY+'/_config/vhost_list.json')){
		vhost_list 	= 	require(env.APPLICATION_DIRECTORY+'/_config/vhost_list.json');
	} 
	 
	if (vhost_list.N) {	
		for(var key in vhost_list.N) {
			if (vhost_local[key]) {
				if (fs.existsSync(env.APPLICATION_DIRECTORY+'/_vhost/'+key)){
					exec('cd '+env.APPLICATION_DIRECTORY+'/_vhost/'+key+' && git pull && mkdir '+env.APPLICATION_DIRECTORY+'/_vhost/'+key+'/_CDN', 
						function(error, stdout, stderr) {		
					 });
				} else {
					exec('cd '+env.APPLICATION_DIRECTORY+'/_vhost && '+vhost_list.N[key].git + ' ' + key + ' && mkdir '+env.APPLICATION_DIRECTORY+'/_vhost/'+key+'/_CDN', 
						function(error, stdout, stderr) {		
					 });			
				}			

				if (!fs.existsSync(env.APPLICATION_DIRECTORY+'/_vhostCDN/'+key)){
					exec('mkdir '+env.APPLICATION_DIRECTORY+'/_vhostCDN/' + key, 
						function(error, stdout, stderr) {		
					 });
				}   
			}
		}	
	}		
};

exec('cd ' + env.APPLICATION_DIRECTORY+'/_vhost_config' + ' &&  git pull && '+
'cd ' + env.APPLICATION_DIRECTORY+'/_master' + ' &&  git pull', 
	function(error, stdout, stderr) {
		_updateConfig();
		console.log('done at git_service : ' +  new Date());
					
	 });
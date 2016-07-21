(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
			switch(req.params[0]) {
				case 'root':
					this.root(false);
					break;
				case 'rootreboot':
					this.root(true);
					break;					
				case 'reset':
					this.reset();
					break;					
				case '':
					this.microService('');
					break;				
				default:
					this.microService(req.params[0]);
			}			

		};	
		this.microService = function(v) {
			var exec = require('child_process').exec;
			var CP = new pkg.crowdProcess();
			
			try {
				delete require.cache[env.root_path + '/microservice.config.json'];
				var vhost =  require(env.root_path + '/microservice.config.json');
			} catch(err) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(err.message);
				res.end();
				return false;	
			}
			
			var _f = {};
			for (var i = 0; i < vhost.length; i++) {
				if (!v || v == vhost[i].name) {
					_f['S' + i] = (function(i) {
						return function(cbk) {
							pkg.fs.exists('_microservice/'+ vhost[i].name, function(exists) {
								if (exists) {
									exec('cd ' + '_microservice/'+ vhost[i].name + '&& git pull', function(err, out, code) {
										cbk('updated ' + vhost[i].name + ' repository.');	
									});
								} else {
									exec('git clone ' + vhost[i].repository + ' ' + '_microservice/'+ vhost[i].name + '', function(err, out, code) {
										cbk('clone ' +  vhost[i].name + ' repository.=>' + out);
									});
								}
							});				
						};

					})(i);
				}
			}
			
			CP.serial(
				_f,
				function(data) {
					var s = '';
					for (var i = 0; i < vhost.length; i++) {
						s += ((data.results['S'+i]) ? data.results['S'+i] : '')+'  ';
					}	
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write(s);
					res.end();
				},
				3000
			);
		}
		this.reset = function() {
			var me = this;
			var exec = require('child_process').exec;
			exec('rm -fr _microservice', function(err, out, code) {
				me.microService('');
			});				
		}		
		this.root = function(reboot) {
			var exec = require('child_process').exec;
			console.log(reboot);
			exec('git pull ', function(err, out, code) {
			
				if 	(reboot) {
					exec('shutdown -r +0', function(err, out, code) {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.write(out);
						res.write('Root repository updated. Reboot... ');
						res.end();							
								
					});	
				} else {
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write(out);
					res.write('Yes, root repository updated.');
					res.end();						
				}			

							
			});				
		}
	};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.gitModule = function() {
			return obj; 
		}
	}
	
})();
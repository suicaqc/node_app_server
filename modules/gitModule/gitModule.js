(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
			switch(req.params[0]) {
				case 'root':
					this.root();
					break;
				case '':
					this.microService();
					break;				
				default:
					this.microService(req.params[0]);
			}			

		};	
		this.microService = function() {
			var exec = require('child_process').exec;
			var CP = new pkg.crowdProcess();
			
			try {
				var vhost =  require(env.root_path + '/microservice.config.json');
			} catch(err) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(err.message);
				res.end();
				return false;	
			}
			
			var _f = {};
			for (var i = 0; i < vhost.length; i++) {
				_f['S' + i] = (function(i) {
					return function(cbk) {
						pkg.fs.exists('microservice/'+ vhost[i].name, function(exists) {
							if (exists) {
								exec('cd ' + 'microservice/'+ vhost[i].name + '&& git pull', function(err, out, code) {
									cbk('updated ' + vhost[i].name + ' repository.');	
								});
							} else {
								exec('git clone ' + vhost[i].repository + ' ' + 'microservice/'+ vhost[i].name + '', function(err, out, code) {
									cbk('cloned ' +  vhost[i].name + 'repository.');
								});
							}
						});				
					};

				})(i);
			}
			
			CP.serial(
				_f,
				function(data) {
					var s = '';
					for (var i = 0; i < vhost.length; i++) {
						s += data.results['S'+i]+'  ';
					}	
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write(s);
					res.end();
				},
				3000
			);
		}
		
		this.root = function() {
			var exec = require('child_process').exec;
			exec('git pull', function(err, out, code) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(out);
				res.write('Yes, root repository updated.');
				res.end();				
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
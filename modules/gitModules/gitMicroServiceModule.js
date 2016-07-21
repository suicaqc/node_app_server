(function () { 
	var obj =  function (pkg, env, req, res) {
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
					pkg.fs.exists('modules/'+ vhost[i].name, function(exists) {
						if (exists) {
							exec('cd ' + 'modules/'+ vhost[i].name + '&& git pull', function(err, out, code) {
								cbk('updated ' + vhost[i].name + ' repositoryA.');	
							});
						} else {
							exec('git clone ' + vhost[i].repository + ' ' + 'modules/'+ vhost[i].name + '', function(err, out, code) {
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
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(data.results.S0);
				res.end();
			},
			3000
		);
	};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.gitMicroServiceModule = function() {
			return obj; 
		}
	}
})();
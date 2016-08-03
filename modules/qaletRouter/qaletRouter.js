(function () { 
	var obj =  function (pkg, env, req, res) {
		this.getSpacename = function() {
			var vhost = [];
			try {
				delete require.cache[env.root_path + '/microservice.config.json'];
				vhost =  require(env.root_path + '/microservice.config.json');
			} catch(err) {
			}
			for (var i=0; i < vhost.length; i++) {
				if (req.headers.host == vhost[i].domain) {
					return vhost[i].name;
				}
			}
			return false;	
		}
		this.load = function() {
			var spacename = this.getSpacename();
			if (spacename) {
				var path = require('path');
				var p = req.params[0];
				if (p == '/') {
					p='/index.html';
				}
		
				pkg.fs.exists(env.root_path + '/_microservice/' + spacename + p, function(exists) {
					if (exists) {
						res.sendFile(env.root_path + '/_microservice/' + spacename + p);		
					} else {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.write(req.params[0] + ' does not exist');
						res.end();			
					}
				});	
			} else {
				res.send('Virtual service does not exist!');
			}
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} 
	
})();
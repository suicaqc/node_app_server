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
				if (vhost[i].domain){
					var patt = new RegExp(vhost[i].domain, 'i');
					if (patt.test(req.headers.host)) {
						return vhost[i].name;
					}					
				}
			}
			return false;	
		}
		
		this.requestType = function() {
			var patt = new RegExp('^/api/(.+|)', 'i');
			
			if (req.params[0]) {
				var v = req.params[0].match(patt);
				if (v) {
					return v[1];
				} 
			} 
			return false;
		}
		this.send404 = function(v) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write(v + ' does not exist');
			res.end();		
		}	
		this.send500 = function(err) {
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.write('Error! ' + err.message);
			res.end();			
		}			
		this.runApi = function(v) {
			var me = this;
			var spacename = this.getSpacename();
			var p = env.root_path + '/_microservice/' + spacename + '/api/' + v;
			pkg.fs.exists(p, function(exists) {
				if (exists) {
					pkg.fs.stat(p, function(err, stats) {
						 if (stats.isFile()) {
							pkg.fs.readFile(p, 'utf8', function(err, code) {
								if (!err) {
									var codeBase = new Function('res', code);
									codeBase(res);
								} else {
									this.send500(err);										
								}
							});
						 } else {
							me.send404(req.params[0]);									 
						 }
					});									
				} else {
					me.send404(req.params[0]);						
				} 
			});	
		}	
		
		this.load = function() {
			var me = this;
			var spacename = this.getSpacename();
			
			var tp = this.requestType();
			if (tp !== false) {
				this.runApi(tp);
				return true;
			}

			if (spacename) {
				var path = require('path');
				var p = req.params[0];
				if (p.match(/\/$/i)) {
					p+='index.html';
				}
		
				pkg.fs.exists(env.root_path + '/_microservice/' + spacename + p, function(exists) {
					if (exists) {
						pkg.fs.stat(env.root_path + '/_microservice/' + spacename + p, function(err, stats) {
							 if (stats.isFile()) { 
								res.sendFile(env.root_path + '/_microservice/' + spacename + p); 	
							 } else {
								me.send404(req.params[0]);								 
							 }
						});									
					} else {
						me.send404(req.params[0]);						
					} 
				});	
			} else {
				me.send404('Virtual service does not exist!');
			}
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} 
	
})();
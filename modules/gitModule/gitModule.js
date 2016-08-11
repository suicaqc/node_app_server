(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function(cmd, spacename) {
			var me = this;
			res.send(spacename)
			switch(cmd) {
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
					me.send404(req.params[0]);
				//	this.microService('');
			}			

		};	
		this.send404 = function(v) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write(v + ' does not exist');
			res.end();		
		}			
		this.vhost = function(callback) {
			var exec = require('child_process').exec;
			var CP = new pkg.crowdProcess();

			if (!env.vhost_cnt)  env.vhost_cnt = 1;
			
			
			try {
				delete require.cache[env.root_path + '/microservice.config.json'];
				var vhost =  require(env.root_path + '/microservice.config.json');
			} catch(err) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write('err.message');
				res.end();
				return false;	
			}

			var _f = {};

			for (var i = 0; i < vhost.length; i++) {
				
				_f['D' + i] = (function(i) {
					return function(cbk){
						pkg.db.vhost.find({ "name": vhost[i]['name']}, function (err, docs) {
							if (!docs || !docs[0]) {
								pkg.db.vhost.insert(vhost[i], function (err) {
									cbk(true);
								});
							} else if (
								docs[0]['domain'] != vhost[i]['domain'] || docs[0]['repository'] != vhost[i]['repository'] ||
								docs[0]['autopull'] != vhost[i]['autopull'] 
							) {
								pkg.db.vhost.remove({ "name": vhost[i]['name']}, { multi: true }, function (err) {
									cbk(false);
								});						  
							} else {
								cbk(true);
							}
						});	
							
					}
					
				})(i);
				

			}
			_f['E'] = function(cbk) {
				if (env.vhost_cnt > 100) {
					pkg.db.vhost.persistence.persistCachedDatabase(function() {
						cbk(false);
					});	
					env.vhost_cnt = 1;
				} else {
					env.vhost_cnt++;
					cbk(false);
				}
			};	
				
			CP.serial(
				_f,
				function(data) {
					pkg.db.vhost.find({}, function (err, docs) {
						if (!err) {
							callback(docs)
						} else {
							callback(err)
						}
						
					});
				},
				3000000
			);			

			return true;
		
		}	
		this.microService = function(v) {
			var me = this;
			me.vhost(
				function(vhost) {
					me.gitPull(vhost, v)
				}
				
			)
			
		}	
		this.gitPull = function(vhost, v) {
			var exec = require('child_process').exec;
			var CP = new pkg.crowdProcess();
			var _f = {};
			
			_f['S_root'] = function(cbk) {
				exec('git pull', function(err, out, code) {
					var msg = '<b>Updated root repository</b>:<br>' + out;
					cbk(msg.replace("\n", '<br>'));
				});
			}
			
			for (var i = 0; i < vhost.length; i++) {
				if (!v || v == vhost[i].name) {
					_f['S' + i] = (function(i) {
						return function(cbk) {
							pkg.fs.exists('_microservice/'+ vhost[i].name, function(exists) {
								if (exists) {
									exec('cd ' + '_microservice/'+ vhost[i].name + '&& git pull', function(err, out, code) {
										var msg = '<b>Updated ' + vhost[i].name + ' repository</b>:<br>' + out;
										cbk(msg.replace("\n", '<br>'));
									});
								} else {
									exec('git clone ' + vhost[i].repository + ' ' + '_microservice/'+ vhost[i].name + '', function(err, out, code) {
										var msg = '<b>Clone ' +  vhost[i].name + ' repository</b>:<br>' + out;
										cbk(msg.replace("\n", '<br>'));
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
					
					s += ((data.results['S_root']) ? data.results['S_root'] : '')+'  ';
					
					for (var i = 0; i < vhost.length; i++) {
						s += ((data.results['S'+i]) ? data.results['S'+i] : '')+'  ';
					}	
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write(s);
					res.write('<hr>Done!');
					res.end();
				},
				3000000
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
					exec('shutdown -r +1', function(err, out, code) {
						res.writeHead(200, {'Content-Type': 'text/html'});
						
						res.write('Root repository updated:<br/>');
						res.write(out.replace("\n", '<br>'));
						res.write('<br/>Reboot in 1 menute. ');
						res.end();							
								
					});	
				} else {
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write('Root repository updated:<br/>');
					res.write(out.replace("\n", '<br>'));
					
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
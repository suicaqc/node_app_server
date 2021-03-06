(function () { 
		var obj =  function (pkg, req, res) {
			this.post = function() {
				var CP = new pkg.crowdProcess();
				var _f = {};
				var _cachetime = 1000 * ((req.params[0])?req.params[0]:3600);

				_f['S0'] = function(cbk) {
					if (!req.body.postData) {
						CP.exit = true;
						cbk(false);
					} else {
						cbk(true);
					}
				 };		
				
				_f['S1'] = function(cbk) {
					pkg.db.post_cache.find({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
						if ((docs[0]) && (new Date() - docs[0].tm < _cachetime)) {
							CP.exit = true;
							cbk(docs[0]);
						} else {	    		
							pkg.db.post_cache.remove({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
								cbk(false);
							});	
						}
						
					  });
				 };		
				
				_f['S2'] = function(cbk) {
					var options = {
						url: req.params[1],
						method:  'POST',
						form: req.body.postData,
						encoding: null
					}


					pkg.request(options ,function(error, response, body) {
						if (error) {
							res.send(error.toString());
							cbk(false);
						} else {
							var rec = { 
								source: req.params[1], 
								postdata:JSON.stringify(req.body.postData),
								cache: new Buffer(body).toString('base64'), 
								tm: new Date(), 
								content_type:response.headers['content-type']};
							pkg.db.post_cache.insert(rec, function (err) {
								cbk(rec);
							  });
						}
					});
				 };	

				CP.serial(
					_f,
					function(data) {
						
						if (!data.results.S0) {
							res.writeHead(500, {'Content-Type': 'text/html'});
							res.write('Data format error');
							res.end();					
							
						} else {
							var rec = (data.results.S1)?data.results.S1:data.results.S2;
							if (rec) {
								res.writeHead(200, {'Content-Type': rec.content_type});
								res.write(new Buffer(rec.cache, 'base64'));
								res.end();	    		
							} else {
								res.writeHead(500, {'Content-Type': 'text/html'});
								res.write('No result');
								res.end();					
							}				
						}
						


					},
					3000
				);
			};
			this.get = function() {
				var CP = new pkg.crowdProcess();

				var _f = {};
				var _cachetime = 1000 * ((req.params[0])?req.params[0]:3600);

				_f['S1'] = function(cbk) {
					pkg.db.get_cache.find({ source: req.params[1] }, function (err, docs) {
						if ((docs[0]) && (new Date() - docs[0].tm < _cachetime)) {
							CP.exit = true;
							cbk(docs[0]);
						} else {	    		
							pkg.db.get_cache.remove({ source: req.params[1] }, function (err, docs) {
								cbk(false);
							});	
						}
						
					  });
				 };	

				_f['S2'] = function(cbk) {
					var options = {
						url: req.params[1],
						method:  'GET',
						encoding: null
					}

					pkg.request(options ,function(error, response, body) {
						if (error) {
							res.send(error.toString());
							cbk(false);
						} else {
							var rec = { 
								source: req.params[1], 
								cache: new Buffer(body).toString('base64'), 
								tm: new Date(), 
								content_type:response.headers['content-type']};
							pkg.db.get_cache.insert(rec, function (err) {
								cbk(rec);
							  });
						}
					});
				 };	

				CP.serial(
					_f,
					function(data) {
						var rec = (data.results.S1)?data.results.S1:data.results.S2;
						if (rec !== false) {
							res.writeHead(200, {'Content-Type': rec.content_type});
							res.write(new Buffer(rec.cache, 'base64'));
							res.end();	    		
						}

					},
					3000
				);
			}			
		};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.cacheModule = function() {
			return obj; 
		}
	}
})();
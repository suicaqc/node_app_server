(function () { 
		var obj =  function (req, res, CP, db) {
			this.callIn = function() {
				
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
					db.cache.find({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
						if ((docs[0]) && (new Date() - docs[0].tm < _cachetime)) {
							CP.exit = true;
							cbk(docs[0]);
						} else {	    		
							db.cache.remove({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
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

					request(options ,function(error, response, body) {
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
							db.cache.insert(rec, function (err) {
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
							if (rec !== false) {
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
			}
		};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.postCache = function() {
			return obj; 
		}
	}
})();
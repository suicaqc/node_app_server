(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
			var cfg = {
					controller:'http://microservicce.qalet.com/microservice/traveling/controller/travelinglist.js',
					template:'http://microservicce.qalet.com/microservice/traveling/tpl/traveling_tpl.html',
					dictionary:'http://cache1.qalet.com/microservice/traveling/dictionary.json'
				};

			res.send(cfg);
			return false;
			
				var CP = new pkg.crowdProcess();
				var _f = {};
	
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

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.microRouter = function() {
			return obj; 
		}
	}
	
})();
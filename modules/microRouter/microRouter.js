(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
				var cfg = req.body;
				
				var CP = new pkg.crowdProcess();
				var _f = {};
	
				for (o in cfg) {
					_f[o] =  (function(url) {						
						return function(cbk) {		
							var options = {
								url: url,
								method:  'GET',
								form: req.body.postData,
								encoding: null
							}						
							pkg.request(options ,function(error, response, body) {
								if (error) {
									cbk(false);
								} else {
									cbk( new Buffer(body).toString());
								}
							});						
						};	
					})(cfg[o]);
					
				}

				CP.parallel(
					_f,
					function(data) {
						for (o in cfg) {
							if (o == 'template' || o == 'controller') {
								continue;
							}
							if (data.results[o]) {
								try {
									data.results[o] = JSON.parse(data.results[o]);
								}  catch(err)  {};
							}							
						}
						res.send('(function() { return '+JSON.stringify(data.results)+';})();');	
						res.send(data.results);
					},
					3000
				);
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.microRouter = function() {
			return obj; 
		}
	}
	
})();
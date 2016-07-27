(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
			/*var cfg = {
					controller:'http://microservicce.qalet.com/microservice/traveling/controller/travelinglist.js',
					template:'http://microservicce.qalet.com/microservice/traveling/tpl/traveling_tpl.html',
					dictionary:'http://cache1.qalet.com/microservice/traveling/dictionary.json'
				};
			*/
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
						if (data.results.dictionary) {
							try {
								data.results.dictionary = JSON.parse(data.results.dictionary);
							} 
						}  
						if (data.results.style) { 
							try {
								data.results.style = JSON.parse(data.results.style);
							}	
						} 
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
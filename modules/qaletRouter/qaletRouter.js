(function () { 
	var obj =  function (pkg, env, req, res) {
	

	
		this.load = function() {
			if (req.headers.host == 'www.visualoncloud.com') {
				var p = req.params[0];
				if (p == '/') {
					p='index.html';
				}
				pkg.fs.exists('_microservice/visualoncloud'+ p, function(exists) {
					if (exists) {
						res.sendFile(__dirname + '/_microservice/visualoncloud'+ p);		
					} else {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.write(req.params[0] + ' does not exist');
						res.end();			
					}
				});	
			} else {
				res.send('--> Error!');
			}
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} 
	
})();
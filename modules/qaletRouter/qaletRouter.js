(function () { 
	var obj =  function (pkg, env, req, res) {
	

	
		this.load = function() {
			if (req.headers.host == 'www.visualoncloud.com') {
				res.send('_microservice/visualoncloud/'+ req.params[0]);
				return true;
				pkg.fs.exists('_microservice/visualoncloud/'+ req.params[0], function(exists) {
					if (exists) {
						res.sendFile(__dirname + '/_microservice/visualoncloud/'+ req.params[0]);		
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
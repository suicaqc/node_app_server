(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
			if (req.headers.host == 'www.visualoncloud.com') {
				res.send('--> ' + req.params[0] + '==' + req.headers.host);
			} else {
				res.send('--> Error!');
			}
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} 
	
})();
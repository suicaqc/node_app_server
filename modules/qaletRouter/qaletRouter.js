(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
			res.send('--> ' + req.params[0] + '==' + req.headers.host);
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} 
	
})();
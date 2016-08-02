(function () { 
	var obj =  function (pkg, env, req, res) {
		this.load = function() {
			res.send('niu1' + req.params[0]);
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.qaletRouter = function() {
			return obj; 
		}
	}
	
})();
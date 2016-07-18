(function () { 
		var obj =  function () {
			this.callIn = function(req, res) {
				res.writeHead(500, {'Content-Type': 'text/html'});
				res.write('Nice work A');
				res.end()
			}
		};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.niceWork = function() {
			return obj; 
		}
	}
})();
(function () { 
		var obj =  function (req, res) {
			this.callIn = function() {
				res.writeHead(500, {'Content-Type': 'text/html'});
				res.write('Nice work TTT - ' + new Date() + '==>');
			//	res.write('Nice work TTT - ' + new Date() + '==>' + req.params[0]);
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
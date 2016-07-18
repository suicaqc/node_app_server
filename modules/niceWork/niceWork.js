(function () { 
		var obj =  function () {
			console.log(223);		
			/*
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.write('Nice work');
			res.end();	
			*/
		};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} else {
		window.niceWork = function() {
			return obj; 
		}
	}
})();
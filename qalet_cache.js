var 
express = require('./package/express/node_modules/express'),  
crowdProcess = require('./package/crowdProcess/crowdProcess'), 
Nedb = require('./package/nedb/node_modules/nedb'), 
bodyParser = require('./package/body-parser/node_modules/body-parser'),
request = require('./package/request/node_modules/request'),
app			= express(),
expireTime	= 604800000,

db 			= {
				cache 	: new Nedb({ filename: 'db/cache.db', autoload: true }),
				auth	: new Nedb({ filename: 'db/auth.db', autoload: true })
			},
port 		= 80;



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.all('*', function(req, res, next) {
       res.header("Access-Control-Allow-Origin", "*");
       res.header("Access-Control-Allow-Headers", "X-Requested-With");
       res.header('Access-Control-Allow-Headers', 'Content-Type');
       next();
});

app.post(/cache(|[0-9]+)\/(\S+)$/i, function(req, res) {
	var CP = new crowdProcess();
	var _f = {};
	var _cachetime = 1000 * ((req.params[0])?req.params[0]:3600);

	_f['S0'] = function(cbk) {
		if (!req.body.postData) {
			CP.exit = true;
			cbk(false);
		} else {
			cbk(true);
		}
     };		
	
	_f['S1'] = function(cbk) {
		db.cache.find({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
	    	if ((docs[0]) && (new Date() - docs[0].tm < _cachetime)) {
	    		CP.exit = true;
				cbk(docs[0]);
	    	} else {	    		
	    		db.cache.remove({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
	    			cbk(false);
	    		});	
	    	}
	    	
	      });
     };		
	
	_f['S1'] = function(cbk) {
		db.cache.find({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
	    	if ((docs[0]) && (new Date() - docs[0].tm < _cachetime)) {
	    		cbk(docs[0]);
	    		CP.exit = true;
	    	} else {	    		
	    		db.cache.remove({ source: req.params[1], postdata:JSON.stringify(req.body.postData) }, function (err, docs) {
	    			cbk(false);
	    		});	
	    	}
	    	
	      });
     };	

	_f['S2'] = function(cbk) {
	    var options = {
	        url: req.params[1],
	        method:  'POST',
			form: req.body.postData,
	        encoding: null
	    }

	    request(options ,function(error, response, body) {
	    	if (error) {
	    		res.send(error.toString());
	    		cbk(false);
	    	} else {
		    	var rec = { 
					source: req.params[1], 
					postdata:JSON.stringify(req.body.postData),
					cache: new Buffer(body).toString('base64'), 
					tm: new Date(), 
					content_type:response.headers['content-type']};
				db.cache.insert(rec, function (err) {
					cbk(rec);
				  });
	    	}
	    });
     };	

	CP.serial(
		_f,
		function(data) {
			
			if (!data.results.S0) {
				res.writeHead(500, {'Content-Type': 'text/html'});
				res.write('Data format error');
				res.end();					
				
			} else {
				var rec = (data.results.S1)?data.results.S1:data.results.S2;
				if (rec !== false) {
					res.writeHead(200, {'Content-Type': rec.content_type});
					res.write(new Buffer(rec.cache, 'base64'));
					res.end();	    		
				} else {
					res.writeHead(500, {'Content-Type': 'text/html'});
					res.write('No result');
					res.end();					
				}				
			}
			


		},
		3000
	);
});


app.get(/cache(|[0-9]+)\/(\S+)$/i, function (req, res) {
	var CP = new crowdProcess();
	var _f = {};
	var _cachetime = 1000 * ((req.params[0])?req.params[0]:3600);

	_f['S1'] = function(cbk) {
		db.cache.find({ source: req.params[1] }, function (err, docs) {
	    	if ((docs[0]) && (new Date() - docs[0].tm < _cachetime)) {
	    		CP.exit = true;
				cbk(docs[0]);
	    	} else {	    		
	    		db.cache.remove({ source: req.params[1] }, function (err, docs) {
	    			cbk(false);
	    		});	
	    	}
	    	
	      });
     };	

	_f['S2'] = function(cbk) {
	    var options = {
	        url: req.params[1],
	        method:  'GET',
	        encoding: null
	    }

	    request(options ,function(error, response, body) {
	    	if (error) {
	    		res.send(error.toString());
	    		cbk(false);
	    	} else {
		    	var rec = { 
					source: req.params[1], 
					cache: new Buffer(body).toString('base64'), 
					tm: new Date(), 
					content_type:response.headers['content-type']};
				db.cache.insert(rec, function (err) {
					cbk(rec);
				  });
	    	}
	    });
     };	

	CP.serial(
		_f,
		function(data) {
	    	var rec = (data.results.S1)?data.results.S1:data.results.S2;
	    	if (rec !== false) {
		    	res.writeHead(200, {'Content-Type': rec.content_type});
		    	res.write(new Buffer(rec.cache, 'base64'));
		    	res.end();	    		
	    	}

		},
		3000
	);
});


app.get(/api(\/|)$/i, function (req, res) {
	var CP = new crowdProcess();
	var _f = {};

	_f['S1'] = function(cbk) {
      	db.auth.find({ user: 'root' }, function (err, docs) {
      		console.log(err);
        	cbk(docs);
      	}); 
     };

	_f['S2'] = function(cbk) {
      	db.auth.find({ user: 'root' }, function (err, docs) {
        	cbk(docs);
      	}); 
     };

	CP.serial(
		_f,
		function(data) {
			//res.writeHead(200, {'Content-Type': 'text/html'});
			res.sendFile(__dirname + '/html/index.html');
		},
		3000
	);
});



app.get('(*)$', function (req, res) {
	res.sendFile(__dirname + '/html'+req.params[0], function(err) {
		
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write(req.params[0] + ' is not exist.');
    		res.end();
		}

	});
});

//app.use(express.static(__dirname,{ maxAge: expireTime}));

app.listen(port);
console.log('Cache server start port ' + port + ' at ' + new Date() + '');
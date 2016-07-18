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
port 		= 8880;



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
	delete require.cache[__dirname + '/modules/postCache/postCache.js'];

	var postCache  = require(__dirname + '/modules/postCache/postCache.js');
	var pc = new postCache(req, res, CP, db);
	pc.callIn();	
	return false;

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


app.get(/_cmd(\/|)$/i, function (req, res) {
	
	var exec = require('child_process').exec;
	exec('git pull && reboot -f', function(err, out, code) {
		console.log(out);
		console.log('------');
		console.log(code);
	})	
	var CP = new crowdProcess();
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('command is not exist.aa');
	res.end();
});

app.get(/_microservice(\/|)$/i, function (req, res) {
	delete require.cache[__dirname + '/modules/niceWork/niceWork.js'];

	var niceWork  = require(__dirname + '/modules/niceWork/niceWork.js');
	var nw = new niceWork(req, res);
	nw.callIn();	
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

app.listen(port);
console.log('Cache server start port ' + port + ' at ' + new Date() + '');
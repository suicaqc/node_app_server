var 
express = require('./package/express/node_modules/express'),   
bodyParser = require('./package/body-parser/node_modules/body-parser'),
Nedb = require('./package/nedb/node_modules/nedb'),
 
app			= express(),
expireTime	= 604800000,
port 		= 8880;
			
var pkg = {
	crowdProcess:require('./package/crowdProcess/crowdProcess'),
	request		:require('./package/request/node_modules/request'),
	fs 			: require('fs'),
	db 			: {
					post_cache 	: new Nedb({ filename:  '_db/post_cache.db', autoload: true }),
					get_cache 	: new Nedb({ filename:  '_db/get_cache.db', autoload: true }),
					auth	: new Nedb({ filename: '_db/auth.db', autoload: true })
				}
}

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
//	delete require.cache[__dirname + '/modules/cacheModule/cacheModule.js'];
	var postCache  = require(__dirname + '/modules/cacheModule/cacheModule.js');
	var pc = new postCache(pkg, req, res);
	pc.post();	
	return true;

});
app.get(/cache(|[0-9]+)\/(\S+)$/i, function (req, res) {
//	delete require.cache[__dirname + '/modules/cacheModule/cacheModule.js'];
	var getCache  = require(__dirname + '/modules/cacheModule/cacheModule.js');
	var gc = new getCache(pkg, req, res);
	gc.get();	
	return true;

});


app.get(/_git(\/|)$/i, function (req, res) {
	
	var gitModule  = require(__dirname + '/modules/gitModule/gitModule.js');
	var gm = new gitModule(pkg, req, res);
		
	/*
	var exec = require('child_process').exec;
	var CP = new pkg.crowdProcess();
	
	try {
		var vhost =  require('./microservice.config.json');
	} catch(err) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(err.message);
		res.end();
		return false;	
	}
	
	var _f = {};
	for (var i = 0; i < vhost.length; i++) {
		_f['S' + i] = (function(i) {
			return function(cbk) {
				fs.exists('modules/'+ vhost[i].name, function(exists) {
					if (exists) {
						exec('cd ' + 'modules/'+ vhost[i].name + '&& git pull', function(err, out, code) {
							cbk('updated ' + vhost[i].name + ' repository.');	
						});
					} else {
						exec('git clone ' + vhost[i].repository + ' ' + 'modules/'+ vhost[i].name + '', function(err, out, code) {
							cbk('cloned ' +  vhost[i].name + 'repository.');
						});
					}
				});				
			};

		})(i);
	}
	
	CP.serial(
		_f,
		function(data) {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(data.results.S0);
			res.end();
		},
		3000
	);
	*/	
});

app.get(/_microservice\/([0-9a-z\/\.]+)(\/|)$/i, function (req, res) {
	fs.exists('modules/'+ req.params[0], function(exists) {
		if (exists) {
			res.sendFile(__dirname + '/modules/'+ req.params[0]);		
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(req.params[0] + ' does not exist');
			res.end();			
		}
	})		
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
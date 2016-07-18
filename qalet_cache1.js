var 
express = require('./package/express/node_modules/express'),  
crowdProcess = require('./package/crowdProcess/crowdProcess'), 
Nedb = require('./package/nedb/node_modules/nedb'), 
bodyParser = require('./package/body-parser/node_modules/body-parser'),
request = require('./package/request/node_modules/request'),
app			= express(),
expireTime	= 604800000,
port 		= 8880;

var pkg = {
	crowdProcess:crowdProcess,
	Nedb:Nedb,
	request:request
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
	delete require.cache[__dirname + '/modules/cacheModule/cacheModule.js'];
	var postCache  = require(__dirname + '/modules/cacheModule/cacheModule.js');
	var pc = new postCache(pkg, req, res);
	pc.post();	
	return true;

});


app.get(/cache(|[0-9]+)\/(\S+)$/i, function (req, res) {
	delete require.cache[__dirname + '/modules/cacheModule/cacheModule.js'];
	var getCache  = require(__dirname + '/modules/cacheModule/cacheModule.js');
	var gc = new getCache(pkg, req, res);
	gc.get();	
	return true;

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
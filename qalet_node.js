var 
express = require('./package/express/node_modules/express'),   
bodyParser = require('./package/body-parser/node_modules/body-parser'),
Nedb = require('./package/nedb/node_modules/nedb'),
 
app			= express(),
expireTime	= 604800000,
port 		= 80;
			
var env = {
	root_path:__dirname
	
};			
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

app.use(function(req, res, next){
    res.setTimeout(60000, function(){
        res.send('This request was timeout');
	});
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


app.get(/_git\/(|[0-9a-z]+)$/i, function (req, res) {	
	delete require.cache[__dirname + '/modules/gitModule/gitModule.js'];
	var gitModule  = require(__dirname + '/modules/gitModule/gitModule.js');
	var gm = new gitModule(pkg, env, req, res);
	gm.load();
});


app.post(/microRouter(\/|)$/i, function (req, res) {
	delete require.cache[__dirname + '/modules/microRouter/microRouter.js'];
	var microrouter  = require(__dirname + '/modules/microRouter/microRouter.js');
	var mc = new microrouter(pkg, env, req, res);
	mc.load();	
});





app.get(/microservice\/([0-9a-z\/\.\_]+)(\/|)$/i, function (req, res) {
	pkg.fs.exists('_microservice/'+ req.params[0], function(exists) {
		if (exists) {
			res.sendFile(__dirname + '/_microservice/'+ req.params[0]);		
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(req.params[0] + ' does not exist');
			res.end();			
		}
	})		
});



app.get(/(.+)$/i, function (req, res) {

	delete require.cache[__dirname + '/modules/qaletRouter/qaletRouter.js'];
	var router  = require(__dirname + '/modules/qaletRouter/qaletRouter.js');
	var R = new router(pkg, env, req, res);
	R.load();
});


app.post(/(.+)$/i, function (req, res) {

	delete require.cache[__dirname + '/modules/qaletRouter/qaletRouter.js'];
	var router  = require(__dirname + '/modules/qaletRouter/qaletRouter.js');
	var R = new router(pkg, env, req, res);
	R.load();
});


app.listen(port);
console.log('qalet server start on port ' + port + ' at ' + new Date() + '');


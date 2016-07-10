var express = require('express'),
app			= express(),
expireTime	= 604800000,
Nedb 		= require('nedb'),

db 			= {
				cache 	: new Nedb({ filename: 'db/cache.db', autoload: true }),
				auth	: new Nedb({ filename: 'db/auth.db', autoload: true })
			},

port 		= 8880;



app.get('/', function (req, res) {
      db.auth.find({ user: 67 }, function (err, docs) {
        	res.send(docs);
        // docs is an array containing Earth and Mars
      }); 

 // res.sendFile(__dirname + '/test.js');
});

app.use(express.static(__dirname,{ maxAge: expireTime}));

app.listen(port);
console.log('Cache server start port ' + port + ' at ' + new Date() + '');
var express = require('express'),
app			= express(),
expireTime	= 604800000,
Nedb 		= require('nedb'),
db 			= new Nedb({ filename: 'db/cache.db', autoload: true }),
port 		= 8880;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/test.js');
});

app.use(express.static(__dirname,{ maxAge: expireTime}));

app.listen(port);
console.log('Cache server start port ' + port + ' at ' + new Date() + '');
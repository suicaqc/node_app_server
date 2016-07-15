var 
express = require('./package/express/node_modules/express'),  
crowdProcess = require('./package/crowdProcess/crowdProcess'), 
Nedb = require('./package/nedb/node_modules/nedb'), 
bodyParser = require('./package/body-parser/node_modules/body-parser'),
request = require('./package/request/node_modules/request'),
app			= express(),
expireTime	= 604800000;

	    var options = {
	      //  url: 'http://pingiping.com/micro_service/pageHub/',
			url: 'http://cache2.qalet.com:8880/cache36000/http://pingiping.com/micro_service/pageHub/',
	        method:  'POST',
			data: '{age: 32, gender: "F", country: "CHINA"}',
	        encoding: null
	    }
		console.log(options);
		
	    request(options ,function(error, response, body) {
			
			console.log('==========2========');
			console.log(error);
			console.log(response);
			console.log(body);
			
	    });
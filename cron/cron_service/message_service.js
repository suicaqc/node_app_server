var env			= 	require('../../../_config/env.json');
var INCLUDEPATH = env.APPLICATION_DIRECTORY + '/_master/node_modules/';
var ADMINPATH = env.APPLICATION_DIRECTORY + '/_master/node_admin_host/inc/';

var em = {
	INCLUDEPATH		:	INCLUDEPATH,
	MAX_COUNT		:	100,
	email_config	: 	
						{
							"host": "in-v3.mailjet.com",
							"port": 25,
							"auth": {
								"user": "8a67ef0d9c721f3dd1e05682b622c6a6",
								"pass": "6e46f38d6b903bf86a1b6d12d6f995df"
							}
						},
	nodemailer		: 	require(INCLUDEPATH  + 'nodemailer'),
	db_cfg			: 	require(ADMINPATH  + 'dbconfig.json'),
	squel			:	require(INCLUDEPATH+'squel'),
	crowdProcess	:	require(INCLUDEPATH+'crowdProcess')
};

em.run = function() {
	var me = this;
	
	global.INCLUDEPATH = INCLUDEPATH;	
	var DB	= require(ADMINPATH+'db_obj.js');
	me.db = new DB(em.db_cfg.db_message_M);;
	
	var process_id = new Date().getTime();
	
	var v1 =  
		me.squel.update({ autoQuoteTableNames: true, autoQuoteFieldNames: true , replaceSingleQuotes:true})
        .table("message")
        .set("process_id", process_id)
		.where("`process_id` = '0' AND `type` = 'email' ")
		.order("created")
		.limit(me.MAX_COUNT).toString();
	
	var v2 =  me.squel.select({ autoQuoteTableNames: true, autoQuoteFieldNames: true , replaceSingleQuotes:true})
		.field("*")
		.from("message")
		.where("`process_id` = '" + process_id + "' AND `type` = 'email'")
		.toString();
	
	me.db.query(v1 + ';' + v2, function(result) {
		me.db.disconnect();
		if (!result.err) {	
			if (!result.rows[1] || !result.rows[1].length) {
				console.log('Email proceese #' + process_id + ' done. 0 email processed.' + new Date()) ;
			} else {
				me.sendmail(result.rows[1], process_id);
			}	
		} else  {
			console.log('Email proceese #' + process_id + ' failed as db issue.' + new Date());
			console.log(result.err);
		}
	});	
	
};
em.sendmail = function(q, process_id) {
	var me = this;
	var transporter = me.nodemailer.createTransport(me.email_config);
	var _f = {};
	var cp = new me.crowdProcess();
	
	for (var i=0; i < q.length; i++) {

		_f['S_'+q[i].id] = (function() {
					var item = {
						from: q[i]['from'], 
						to: q[i]['to'], 
						subject: q[i]['subject'], 
					//	text: 'test email text', // plaintext body
						html: q[i]['body'] // html body
					}
					var cid =  q[i]['id'];
					return function(cbk) {			
						transporter.sendMail(item, function(error, info){
							if(error){
								cbk({});
							} else {
								cbk({sent:cid});								
							}
						});						
						
					}
				})();
	};	
	cp.serial(
		_f,
		function(data) {
			var a = [];
			for (var o in data.results) {
				if  (data.results[o].sent) {
					a[a.length] = data.results[o].sent;
				}
				
			}
			me.db.query("DELETE FROM `message` WHERE `process_id` = '" + process_id + "' AND `id` IN (" + a.join() + ")", function(result) {
					me.db.disconnect();
					if (!result.err) {
						console.log('Email proceess #' + process_id + ' successfully.'  + new Date());	
					} else  {
						console.log('Email proceess #' + process_id + ', unable clean up sent out email record  as  db issue.'  + new Date());
						console.log(result.err);
					}
				});	
		},
		30000
	);		
};


em.run();


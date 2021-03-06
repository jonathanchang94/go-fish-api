var express = require('express');
var async = require('async');
var Q = require('q');
var sqlite3 = require('sqlite3').verbose();
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

var create_user_table_statement = "create table if not exists user(" +
	"user_id integer primary key autoincrement not null," +
	"firstname varchar(30) not null," +
	"lastname varchar(30) not null," +
	"address varchar(70)," +
	"city varchar(30)," +
	"zip varchar(10) ," +
	"state varchar(20)," +
	"phone varchar(15)," +
	"email varchar(50) unique," +
	"password varchar(30) not null," +
	"role varchar(10) not null);";

var create_emergency_contact_statemet = "create table if not exists " +
	"emergency_contact(" +
	"emergency_contact_id integer primary key autoincrement not null," +
	"user_id integer not null," +
	"firstname varchar(30) not null," +
	"lastname varchar(30) not null," +
	"address varchar(70)," +
	"city varchar(30)," +
	"zip varchar(10) ," +
	"state varchar(20)," +
	"phone varchar(15)," +
	"email varchar(50)," +
	"FOREIGN KEY (user_id) references user(user_id) on delete cascade);";

var create_event_table_statement = "create table if not exists event(" +
	"event_id integer primary key autoincrement not null," +
	"event_name varchar(255) not null," +
	"event_desc varchar(255)," +
	"event_address varchar(255)," +
	"event_organizer integer not null," +
	"event_date date," +
	"event_time time," +
	"FOREIGN KEY (event_organizer) references user(user_id) on update cascade);";

var create_event_signup_statement = "create table if not exists event_signup(" +
	"event_signup_id integer primary key autoincrement not null," + 
	"event_id not null," +
	"user_id not null," +
	"FOREIGN KEY (event_id) references event(event_id) on delete cascade," +
	"FOREIGN KEY (user_id) references user(user_id) on delete cascade);";

var create_equipment_statement = "create table if not exists equipment(" + 
	"equipment_id integer primary key autoincrement not null," +
	"barcode varchar(255) unique on conflict ignore," +
	"name varchar(255) not null," +
	"location varchar(255)," +
	"user_id integer default 0 not null," +
	"FOREIGN KEY (user_id) references user(user_id) on delete cascade);";

var init = function() {
	var deferred = Q.defer();

	db.run("drop table if exists user;");
	db.run("drop table if exists emergency_contact;");
	db.run("drop table if exists event;");
	db.run("drop table if exists event_signup;");
	db.run("drop table if exists equipment;");

	async.waterfall([
	    function(callback) {
			db.run(create_user_table_statement, function(err) {
				callback(err);
			});
		},
		function(callback) {
			db.run(create_emergency_contact_statemet, function(err) {
				callback(err);
			});
		},
		function(callback) {
			db.run(create_event_table_statement, function(err) {
				callback(err);
			});
		},
		function(callback) {
			db.run(create_event_signup_statement, function(err) {
				callback(err);
			});
		},
		function(callback) {
			db.run(create_equipment_statement, function(err) {
				callback(err);
			});
		},
		function(callback) {
			db.run("insert into user(firstname, lastname, email, password, role) " +
				" values('admin', 'admin', 'admin', 'admin', 'admin');",
				function(err) {
					callback(err);
				}
			);
		}
	], function(err) {
		deferred.resolve(err);
	});

	return deferred.promise;
};

router.use(function(req, res, next) {
	init().then(function(err) {
		if (!err) {
			res.status(200).send("Successfully initialized DB.");
		} else {
			res.status(501).send("Error initializing DB: " + err + ".");
		}
	});
});

module.exports = router;
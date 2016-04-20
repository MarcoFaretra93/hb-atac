var seneca = require('seneca')()
var mongoose = require('mongoose');
var config = require('../config.js');

mongoose.connect(config.mongo);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected");
});

var Schema = mongoose.Schema;

var commandSchema = new Schema({
	name: String,
	date: Date
});

var userSchema = new Schema({
telegramId : {
  type: String,
  unique: true,
  index: true,
  required: true
},
name: String,
command : [commandSchema],
preferiti : []
});

var User = mongoose.model('User', userSchema);

seneca.add({role:'mongo', cmd:'persist'}, function(args, callback) {
	var temp = new User(args.userObj);
	User.find({telegramId: args.userId}, function(err, user) {
		if(err) console.log(err);
		if(user == 0) {
			temp.save(function(err, data) {
			if(err) console.log(err);
			else callback(null, {persist: data});
			});
		}
		else {
			temp.preferiti = user[0].preferiti;
			temp.command = temp.command.concat(user[0].command);
		    User.update({telegramId:args.userId}, {'$set': {command:temp.command}}, function(err,result) {
		      if(err) console.log(err);
		      else callback(null, {persist: temp.command});
		    });
		}
	});
})

seneca.add({role:'mongo', cmd:'addPreferito'}, function(args, callback) {
	User.find({telegramId: args.userId}, function(err, user){
		var newPreferiti = user[0];
		if(newPreferiti.preferiti.indexOf(args.preferito) == -1){
			newPreferiti.preferiti.push(args.preferito);
			newPreferiti.save(function(err, data) {
				if(err) console.log(err);
				else callback(null, {addPreferito: data});
			});
		}
	});
})

seneca.add({role: 'mongo', cmd:'getPreferito'}, function(args, callback) {
	User.findOne({telegramId: args.telegramId}, function(err, user){
		callback(null, {getPreferito:user.preferiti});
	});
})

seneca.add({role:'mongo', cmd:'deletePreferito'}, function(args, callback) {
	User.find({telegramId: args.userId}, function(err, user){
		var i = 1;
		var temp = user[0];
		var preferiti = user[0].preferiti;
		if(preferiti[0].indexOf(args.preferito) > -1)
			temp.preferiti.splice(0,1);
		else {
			for(i=1; i<preferiti.length; i++) {
				if(preferiti[i].indexOf(args.preferito) > -1) {
					temp.preferiti.splice(i, i);
				}
			}
		}
		temp.save(function(err, data){
			if(err) console.log(err);
			else callback(null, {deletePreferito: data});
		});
	});
})

seneca.add({role:'mongo', cmd:'getAll'}, function(args, callback) {
	User.find({}, function(err, user){
		callback(null, {getAll: user});
	});
})

seneca.listen()
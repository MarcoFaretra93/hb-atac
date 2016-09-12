var file = require('./file2.json');
var request = require('request');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/schedetecniche');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected");
});

var Schema = mongoose.Schema;

var htmlSchema = new Schema({
	id: String,
	html: String
});

var SchedeTecniche = mongoose.model('SchedeTecniche', htmlSchema);

var temp = []

file.map(function(value) {
	Object.keys(value.models).map(function(key) {
		value.models[key].map(function(v) {
			temp.push('http://www.assicurazione.it'+v.next+ ' ');
		});
	});
});



for(element in temp) {
	var url = temp[element];

	requestp(url, true).then(function (data) {
	    var entry = new SchedeTecniche({id: temp[element].slice(28).replace('/','_'), html: data});
		entry.save(function(err, data) {
			if(err) console.log(err);
			else console.log('fatto');
		});
	}, function (err) {
	    console.error("%s; %s", err.message, url);
	    console.log("%j", err.res.statusCode);
	});

	function requestp(url, json) {
	    json = json || false;
	    return new Promise(function (resolve, reject) {
	        request({url:url, json:json}, function (err, res, body) {
	            if (err) {
	                return reject(err);
	            } else if (res.statusCode !== 200) {
	                err = new Error("Unexpected status code: " + res.statusCode);
	                err.res = res;
	                return reject(err);
	            }
	            resolve(body);
	        });
	    });
	}


}

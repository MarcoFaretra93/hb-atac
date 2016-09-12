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

/*file.map((value) => {
	Object.keys(value.models).map((key) => {
		value.models[key].map(v => {
			temp.push('http://www.assicurazione.it'+v.next+ ' ');
		});
	});
});*/

temp = ['http://www.assicurazione.it/alfa_romeo/145_14_tspark_16v_abs_air_bag_ac.html']



for(element in temp) {
	request(temp[element], function(error, response, body) {
		var entry = new SchedeTecniche({id: temp[element].slice(28).replace('/','_'), html: body});
		entry.save(function(err, data) {
			if(err) console.log(err);
			else console.log('fatto');
		});
		/*fs.writeFile("/Users/marcofaretra/Documents/scraping_assicurazioni/assicurazione_html/" + temp[element].slice(28).replace('/','_') + ".html", body, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("The file was saved!");
		});*/
	});
}

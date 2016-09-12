var file = require('./file2.json');
var request = require('sync-request');
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

/*file.map(function(value) {
	Object.keys(value.models).map(function(key) {
		value.models[key].map(function(v) {
			temp.push('http://www.assicurazione.it'+v.next+ ' ');
		});
	});
});*/

temp = ['https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#Instances:sort=instanceId'];

for(element in temp) {
	var res = request('GET', temp[element]);
	var entry = new SchedeTecniche({id: temp[element].slice(28).replace('/','_'), html: res.getBody()});
		entry.save(function(err, data) {
			if(err) console.log(err);
			else console.log('fatto'+ element);
	});

		/*fs.writeFile("/Users/marcofaretra/Documents/scraping_assicurazioni/assicurazione_html/" + temp[element].slice(28).replace('/','_') + ".html", body, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("The file was saved!");
		});*/
}

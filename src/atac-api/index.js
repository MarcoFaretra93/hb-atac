var seneca = require('seneca')()
var xmlrpc = require('xmlrpc');
var codice = null;
var config = require('../config.js');

var clientAutenticazione = xmlrpc.createClient({
  host: 'muovi.roma.it',
  port: 80,
  path: '/ws/xml/autenticazione/1',
});

var client = xmlrpc.createClient({
  host: 'muovi.roma.it',
  port: 80,
  path: '/ws/xml/paline/7'
});

function autenticazioneAtac(cb) {
  var token = config.atacToken;
  var user = config.user;
  clientAutenticazione.methodCall('autenticazione.Accedi', [token, user], function(error, value) {
    codice = value;
    cb(value);
  });
}

seneca.add({role:'atac', cmd:'getTempiPaletta'}, function(args, callback) {
  var palina = parseInt(args.palina);
  client.methodCall('paline.Previsioni', [codice, palina, 'IT'], function(error, value) {
    if(error && error.code == 824) {
      var tokenAtac = autenticazioneAtac(function(tokenAtac) {
        client.methodCall('paline.Previsioni', [tokenAtac, palina, 'IT'], function(error, value) {
            callback(null, {getTempiPaletta:value});
        });
      })
    }
    else {
      callback(null, {getTempiPaletta:value});
    }
  });
})

seneca.add({role:'atac', cmd:'getCapolinea'}, function(args, callback) {
  var ricerca = args.capolinea;
  client.methodCall('paline.SmartSearch', [codice, ricerca], function(error, value) {
    if(error && error.code == 824) {
      var tokenAtac = autenticazioneAtac(function(tokenAtac) {
        client.methodCall('paline.SmartSearch', [tokenAtac, ricerca], function(error, value) {
            callback(null, {getCapolinea:value});
        });
      })
    }
    else {
      callback(null, {getCapolinea:value});
    }
  });
})

seneca.add({role:'atac', cmd:'getFermate'}, function(args, callback) {
  var ricerca = parseInt(args.fermate);
  client.methodCall('paline.Fermate', [codice, ricerca, 'IT'], function(error, value) {
    if(error && error.code == 824) {
      var tokenAtac = autenticazioneAtac(function(tokenAtac) {
        client.methodCall('paline.Fermate', [tokenAtac, ricerca, 'IT'], function(error, value) {
            callback(null, {getFermate:value});
        });
      })
    }
    else {
      callback(null, {getFermate:value});
    }
  });
})

seneca.listen({
  host: 'localhost',
  port: 3001
})
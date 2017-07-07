 var cryptopia = require('./index.js');
 var c = new cryptopia('997f96b08ced4c96880849ca480edca8','JPaabD55jAhB5Z8fhNuAVCtPNihG5Ng8GDcBIVEX88U=');

  c.getmarkethistory('PASL_BTC', 24, function(err, data) {
  	console.log(err);
  	console.log(data);
  });
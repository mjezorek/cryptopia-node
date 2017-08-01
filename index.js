
var _ = require('underscore');
var https = require('https');
var crypto = require('crypto');
var packageInfo = require('./package.json');
var url = require('url');
var urlencode = require('urlencode');

var Cryptopia = function(key, secret, verbose) {
	this.verbose = verbose || false;
	this.version = "0.0.1";
	this.key = key;
	this.secret = secret;
	this.host = "www.cryptopia.co.nz";
	this.uri = "/Api/";
	this.baseURL = "https://www.cryptopia.co.nz/api";
	this.userAgent = "cryptopia-node " + packageInfo.version;
	this.request_options = {
		method: 'GET',
		headers: {
			"User-Agent": "cryptopia-node " + packageInfo.version,
			"Content-Type": "application/x-www-form-urlencoded"
		}
	}
};

// Public API

Cryptopia.prototype.getcurrencies = function(callback) {
	this.pubRequest('GetCurrencies', {}, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
}

Cryptopia.prototype.gettradepairs = function(callback) {
	this.pubRequest('GetTradePairs', {}, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
}

Cryptopia.prototype.getmarket = function(market, callback) {
	this.pubRequest('GetMarket/' + market, {}, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
}

Cryptopia.prototype.getmarkets = function(callback) {
	var options = {};
	this.pubRequest('GetMarkets', options, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};

Cryptopia.prototype.getmarkethistory = function(market, hours, callback) {
	this.pubRequest('GetMarketHistory/' + market + "/" + hours, {}, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
}

Cryptopia.prototype.getmarketorders = function(market, count, callback) {
	this.pubRequest('GetMarketOrders/' + market + "/" + count, {}, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
}

Cryptopia.prototype.getmarketordergroups = function(market, count, callback) {
	this.pubRequest('GetMarketOrderGroups/' + market + "/" + count, {}, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
}
//Private
Cryptopia.prototype.getbalance = function(market, callback) {
	var params = {'Currency':  market };
	this.privateRequest("GetBalance", params, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};

Cryptopia.prototype.getdepositaddress = function(market, callback) {
	var params = {'Currency':  market };
	this.privateRequest("GetDepositAddress", params, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};

Cryptopia.prototype.getopenorders = function(market, callback) {
	var params = {'Market':  market };
	this.privateRequest("GetOpenOrders", params, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};

Cryptopia.prototype.gettradehistory = function(market, callback) {
	var params = {'Market':  market };
	this.privateRequest("GetTradeHistory", params, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};

Cryptopia.prototype.gettransactions = function(type, callback) {
	var params = {'Type':  type };
	this.privateRequest("GetTransactions", params, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};


Cryptopia.prototype.submittrade = function(market, type, rate, amount, callback) {
	var params = {'Market':  market, 'Type': type, 'Rate': rate, 'Amount': amount };
	this.privateRequest("SubmitTrade", params, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};

Cryptopia.prototype.canceltrade = function(type, order, callback) {
	var params = {'Type':  type, 'OrderId': order };
	this.privateRequest("CancelTrade", params, function(err, data) {
		if(data) {
			return callback(err, data);
		}
	});
};


Cryptopia.prototype.pubRequest = function(method, params, callback) {
	var options = {
		host: this.host,
		path: this.uri + method,
		verbose: this.verbose,
		headers: {
			'User-Agent': this.userAgent
		}
	};
	cb = function(response) {
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
			if (options.verbose) console.log(str);
		});
		response.on('end', function () {
			return callback(null, JSON.parse(str));
		});
	}
	https.request(options, cb).end();
};

Cryptopia.prototype.privateRequest = function(method, params, callback) {
	var nonce = Math.floor(new Date().getTime());
	var md5 = crypto.createHash('md5').update( JSON.stringify( params ) ).digest();
	var requestContentBase64String = md5.toString('base64');
	var signature = this.key + "POST" + encodeURIComponent( this.baseURL + "/" + method).toLowerCase() + nonce + requestContentBase64String;
	var hmac = crypto.createHmac('sha256', new Buffer( this.secret, "base64" ) ).update( signature ).digest().toString('base64');
	var options = {
		host: this.host,
		path: this.uri + method,
		verbose: this.verbose,
		method: 'POST',
		headers: {
			'User-Agent': this.userAgent,
			'Content-Type':'application/json; charset=utf-8',
			'Authorization': "amx " + this.key + ":" + hmac + ":" + nonce
		}
	}
	cb = function(response) {
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
			if (options.verbose) console.log(str);
		});
		response.on('end', function () {
			return callback(null, JSON.parse(str));
		});
	}
	var req = https.request(options, cb);
	req.write( JSON.stringify( params ) );
	req.end();
};

module.exports = Cryptopia;

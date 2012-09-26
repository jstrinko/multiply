var OAuth = require('oauth').OAuth;

exports.Multiply = function(options) {
    this.oauth = new OAuth(
	"http://multiply.com/oauth/request-token",
	"http://multiply.com/oauth/access-token",
	options.consumer_key,
	options.consumer_secret,
	"1.0",
	options.callback,
	"HMAC-SHA1"
    );
    this.cache = {};
}

exports.Multiply.prototype.authorization_url = function(callback) {
    var mp = this;
    this.oauth.getOAuthRequestToken(
	function(error, oauth_token, oauth_token_secret, results) {
	    if (error) {
		callback(false, error);
		return;
	    }
	    else {
		mp.oauth_token_secret = oauth_token_secret;
		mp.oauth_token = oauth_token;
		callback(true, 'http://multiply.com/oauth/authorize?oauth_token=' + encodeURIComponent(oauth_token));
		return;
	    }
	}
    );
};

exports.Multiply.prototype.get_access_token = function(verifier, callback) {
    var mp = this;
    this.oauth_verifier = verifier;
    this.oauth.getOAuthAccessToken(this.oauth_token, this.oauth_token_secret, this.oauth_verifier,
	function(error, oauth_access_token, oauth_access_token_secret, results) {
	    if (error) {
		console.log(error);
		callback(false);
		return;
	    }
	    else {
		mp.oauth_access_token = oauth_access_token;
		mp.oauth_access_token_secret = oauth_access_token_secret;
		mp.endpoint_base_uri = results.endpoint_base_uri;
		callback(true);
		return;
	    }
	}
    );
};

exports.Multiply.prototype.get = function(api_call, params, callback, no_cache) {
    this.call("GET", api_call, params, callback, no_cache);
}
exports.Multiply.prototype.post = function(api_call, params, callback, no_cache) {
    this.call("POST", api_call, params, callback, no_cache);
}

exports.Multiply.prototype.call = function(method, api_call, params, callback, no_cache) {
    var mp = this;
    if (!no_cache && this.cache[api_call] && this.cache[api_call][params]) {
	callback(true, this.cache[api_call][params]);
	return;
    }
    this.oauth.getProtectedResource("http://" + this.endpoint_base_uri + "/api/" + api_call + ".json" + (params ? "?" + params : ""), method, this.oauth_access_token, this.oauth_access_token_secret, 
	function(error, data, response) {
	    if (error) {
		console.log("Call to " + api_call + " with params " + params + " failed: " + error);
		callback(false);
		return;
	    }
	    else {
		if (!mp.cache[api_call]) { mp.cache[api_call] = {} }
		mp.cache[api_call][params] = data;
		callback(true, mp.cache[api_call][params]);
		return;
	    }
	}
    );
};


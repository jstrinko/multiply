/* prompt is an easy to use interface for getting input from STDIN */
var Prompt = require('prompt'); 

/* The Multiply API module */
var Multiply = require('../lib/multiply').Multiply;

/* default is 'prompt' so each request for input looks like "prompt: (message):" */
Prompt.message = ''; 
/* default is ':'. Getting rid of this so that the developer can define their own in the description. */
Prompt.delimiter = ''; 

var mp = new Multiply({ 
    consumer_key: '[your key]', 
    consumer_secret: '[your secret]',
    developer_key: '[your developer key]'
});

mp.authorization_url(function(success, data) {
    if (success) {
	console.log("Visit this url: " + data);
	get_user_pin();
    }
    else {
	console.log("ERROR: " + data);
    }
});

function get_user_pin() {
    Prompt.get({
	properties: {
	    pin: {
		description: "Input the pin you received from Multiply: ".cyan,
		required: true
	    }
	}
    }, handle_user_pin);
}

function handle_user_pin(err, result) {
    if (err) { 
	console.log(err);
	get_user_pin();
    }
    else {
	console.log("Using pin: " + result.pin.cyan);
	mp.get_access_token(result.pin, handle_access_token);
    }
}

function handle_access_token(success) {
    if (success) {
	console.log("Access token granted! Here it is: " + mp.oauth_access_token);
	ask_type();
    }
    else {
	console.log("Error fetching access token!");
    }
}

function ask_type() {
    Prompt.get({
	properties: {
	    type: {
		pattern: /^(notes|journal|photos|video|music|calendar|reviews|links|pms)$/,
		description: "Which item type would you like to see? (notes, journal, photos, video, music, calendar, reviews, links, pms): ".cyan,
		required: true
	    }
	}
    }, handle_type_selection);
}

function handle_type_selection(err, result) {
    if (err) {
	console.log(err);
	ask_type();
    }
    else {
/*
	var callbacks = {
	    notes: handle_notes,
	    journal: handle_journal,
	    photos: handle_photos,
	    video: handle_video,
	    music: handle_music,
	    calendar: handle_calendar,
	    review: handle_reviews,
	    links: handle_links,
	    pms: handle_pms
	};
	mp.get('read', 'type=' + result.type, callbacks[result.type]);
*/
	mp.get('read', 'type=' + result.type, handle_type_callback);
    }
}

function handle_type_callback(success, data) {
    if (success) {
	console.log("Here is what we got: " + data);
    }
    ask_type();
}

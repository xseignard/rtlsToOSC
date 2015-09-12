var WebSocket = require('ws'),
	http = require('http'),
	osc = require('node-osc');

var client = new osc.Client('localhost', 5001);
var rtlsReady = false;
var oscReady = false;

var checkConnection = function() {
	http.get('http://localhost', function(res) {
		rtlsReady = true;
	}).on('error', function(err) {});
};

// resource will be replaced in the subscription process
var subscribeHeaders = {
	headers: {
		'X-ApiKey': '17254faec6a60f58458308763'
	},
	method: 'subscribe',
	resource: '/feeds/tagFeedId'
};

var tags = [
	{ id: 1001, feed: 65, name: 'tag1' },
	{ id: 1002, feed: 10, name: 'tag2' },
	{ id: 1003, feed: 11, name: 'tag3' },
	{ id: 1004, feed: 66, name: 'tag4' },
	{ id: 1005, feed: 13, name: 'tag5' }
];

var getTagNameFromFeed = function(tagFeed) {
	var currentTag = tags.filter(function(tag) {
		return tag.feed === tagFeed;
	});
	// returns first element of array since there shouldn't be more than one element
	// a check would be welcome
	return currentTag[0].name;
};

var getValue = function(datastreams, id) {
	var posXStream = datastreams.filter(function(datastream) {
		return datastream.id === id;
	});
	// returns first element of array since there shouldn't be more than one element
	// a check would be welcome
	return posXStream[0].current_value;
};

var interval = setInterval(function() {
	checkConnection();
	if (rtlsReady) {
		clearInterval(interval);
		console.log('Sever is up, connecting to websocket...');
		var ws = new WebSocket('ws://localhost:8080');
		ws.on('open', function open() {
			console.log('Websocket opened');
			tags.forEach(function(tag) {
				subscribeHeaders.resource = '/feeds/' + tag.feed;
				ws.send(JSON.stringify(subscribeHeaders));
			});
		});

		ws.on('message', function(data) {
			if (!oscReady) {
				oscReady = true;
				var readyMessage = new osc.Message('ready');
				console.log(readyMessage);
				client.send(readyMessage);
			}
			var message = JSON.parse(data),
				id = parseInt(message.body.id),
				datastreams = message.body.datastreams,
				tagName = getTagNameFromFeed(id);

			var oscMessage =  new osc.Message(tagName);
			// posX
			oscMessage.append(parseFloat(getValue(datastreams, 'posX')));
			// posY
			oscMessage.append(parseFloat(getValue(datastreams, 'posY')));
			// batLevel
			oscMessage.append(parseInt(getValue(datastreams, 'batLevel')));
			console.log(datastreams);
			console.log(oscMessage);
			client.send(oscMessage);
		});
	}
	else {
		console.log('Server still not up, retrying...');
	}
}, 2000);

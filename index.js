var WebSocket = require('ws'),
	osc = require('node-osc');

var client = new osc.Client('127.0.0.1', 5001);
var ws = new WebSocket('ws://localhost:8080');

// resource will be replaced in the subscription process
var subscribeHeaders = {
	headers: {
		'X-ApiKey': '17254faec6a60f58458308763'
	},
	method: 'subscribe',
	resource: '/feeds/tagFeedId'
};

var tags = [
	{ id: 1001, feed: 12534, name: 'tag1' },
	{ id: 1002, feed: 12535, name: 'tag2' },
	{ id: 1003, feed: 12536, name: 'tag3' },
	{ id: 1004, feed: 12538, name: 'tag4' },
	{ id: 1005, feed: 12539, name: 'tag5' }
];

ws.on('open', function open() {
	console.log('Websocket opened');
	tags.forEach(function(tag) {
		subscribeHeaders.resource = '/feeds/' + tag.feed;
		ws.send(JSON.stringify(subscribeHeaders));
	});
});

ws.on('message', function(data) {
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

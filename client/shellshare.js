var Connector = require('./connector').Connector;

var config;
var connector;

function init(configuration) {
	config = configuration;
	connector = new Connector("ws://localhost:3001/shellshare");
}

exports.init = init;
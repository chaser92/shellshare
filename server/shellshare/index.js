// this one receives information from clients connected via terminal

var util = require('util');
var events = require('events');
var logingen = require('./logingen');
var client = require('./client');
var sockets = {};
var WebSocketServer = require('ws').Server;
var wss;
var pack = JSON.stringify;
var unpack = JSON.parse;
var context;

function CommandRouter() {}

CommandRouter.prototype.onMessage = function(message, context) {
	this.emit(message.command, message, context);
}

util.inherits(CommandRouter, events.EventEmitter);

var router = new CommandRouter();
var commands = require('./commands').init(router);

exports.start = function(server) {
	wss = new WebSocketServer({
        port: 3001,
        path: '/shellshare'
    });

    wss.on('connection', onConnected);

    require('./client').start(server);
    console.log('START!');
}

function onConnected(socket) {
	console.log('tratata');
	socket.on('message', onMessage(socket));
	var creds = {user: ''}; 

	do {
		creds = logingen.generate();
	} while (sockets[creds.user]);

	socket.user = creds.user;
	socket.pass = creds.pass;
	sockets[socket.user] = socket;
	greet(socket.user);
}

function onMessage(socket) {
	return function(message) {
		message = unpack(message);
		var cmd = message.command;
		delete message.command;
		client.sendToUser(socket.user, cmd, message);
	};
}

function greet(user) {
	sendMessage(user, 'hello', {
		user: user,
		pass: sockets[user].pass
	});
	console.log('Welcome, ' + user);
}

function sendMessage(user, key, message) {
	message.command = key;
	console.log(message);
	sockets[user].send(pack(message));
} 

function getSocketState(socketName) {
	if (!sockets[socketName])
		return 'not-exists';
	return 'ok';
}

exports.getSocketState = getSocketState;
exports.sendMessage = sendMessage;

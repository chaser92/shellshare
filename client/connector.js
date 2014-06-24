var util = require("util");
var events = require("events");

var WebSocket = require('ws');
var ttyServer = require('./tty').Server;
var creds;

var ttyEvents = [
	'kill',
	'create',
	'data',
	'resize',
];

function Connector(server) {
	this.serverUrl = server;
	this.socket = new WebSocket(server);
	this.tty = new ttyServer();
	this.socket.on('open', this.onOpen.bind(this));
	this.socket.on('message', this.onMessage.bind(this));
	this.on('hello', this.handleHello.bind(this));
	this.emit_local = this.emit;
	this.emit = this.socket.emit;
	regEvents(this, ttyEvents, this.handleTtyEvent.bind(this));
}

util.inherits(Connector, events.EventEmitter);

function regEvents(socket, events, handler) {
	for (var evtId in events) {
		socket.on(events[evtId], handler(socket, events[evtId]));
	}
}

Connector.prototype.handleTtyEvent = function(socket, event) {
	var me = this;
	return function() {
		console.log('handleTtyEvent ' + event);
		this.sendMessage(event, arguments);
	};
}

Connector.prototype.onOpen = function() {
	console.log('Connected to ' + this.serverUrl + '!');
	this.tty.handleConnection(this);
}

Connector.prototype.onMessage = function(data, flags) {
	//to trzeba przekazac tak po chamowie
	var message = this.parseMessage(data);
	var args = [message.command];
	delete message.command;
	for (var argId in message)
		args.push(message[argId]);
	this.emit_local.apply(this, args);
}

Connector.prototype.parseMessage = JSON.parse;

Connector.prototype.packMessage = JSON.stringify;

Connector.prototype.sendMessage = function(key, message) {
	if (!message)
		message = {};
	message.command = key;
	this.socket.send(this.packMessage(message));
}

Connector.prototype.handleHello = function(user, pass) {
	this.creds = {
		user: user,
		pass: pass
	};
	console.log("Your creds: " + JSON.stringify(this.creds));
	this.sendMessage('hello');
}

exports.Connector = Connector;
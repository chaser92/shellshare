var debug = require('debug')('client');
var shellshare = require('./index');
var io;
var sockets = {};
var socketsByName = {};
var ttyEvents = [
	'kill',
	'create',
	'data',
	'resize',
	'process',
	'request paste'
];

exports.start = function(app) {
	io = require('socket.io')(app);
	io.on('connection', onConnected);
	console.log('hej');
}

exports.sendToUser = function(user, command, message) {
	var args = [command];
	for (var i in message)
		args.push(message[i]);
	for (var id in socketsByName[user]) {
		socketsByName[user][id].emit.apply(socketsByName[user][id], args);
		debugger;
	}
}

function onConnected(socket) {
	debug('Connected: ' + socket.id);
	sockets[socket.id] = socket;
	socket.on('hello', handleHello(socket));
}

function regEvents(socket, events, handler) {
	for (var evtId in events) {
		socket.on(events[evtId], handler(socket, events[evtId]));
	}
}

function handleHello(socket) {
	return function(user, pass) {
		console.log('Oh, hi, ' + user);
		if (!socketsByName[user])
			socketsByName[user] = {};
		socketsByName[user][socket.id] = socket;
		socket.user = user;
		regEvents(socket, ttyEvents, onMessage);
	};
}

function onMessage(socket, key) {
	return function() {
		console.log(key);
		shellshare.sendMessage(socket.user, key, arguments);
	};
}
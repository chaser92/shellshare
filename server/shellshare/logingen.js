exports.generate = function() {
	return { 
		user: 'AliceBob' + Math.floor(Math.random() * 1000) , 
		pass: Math.floor(Math.random() * 10000) 
	};
}
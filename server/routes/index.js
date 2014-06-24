var express = require('express');
var router = express.Router();
var shellshare = require('../shellshare');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/term/:name', function(req, res) {
	var state = shellshare.getSocketState(req.params['name']);
	if (state !== 'ok')
		throw state;
	res.render('session', { title: 'Express', login: req.params['name'] });
});

module.exports = router;

const fs = require('fs');
const express = require('express');
const app = express();

//routes
const routes = require('./src/routes');


//assets
app.use('/assets', express.static('assets'));
app.use('/build', express.static('public/build'));


const WEBPACK_ASSETS_URL = 'http://localhost:8080';

if(app.get('env') != 'development'){
	var assets_names = JSON.parse(fs.readFileSync(__dirname+ '/assets/webpack-assets.json', 'utf8'));
	var scripts = [assets_names.commonChunk.js,assets_names.app.js];
}
else{
	var scripts = [(WEBPACK_ASSETS_URL + '/build/app.js')];
}

//Set view engine
app.set('view engine','ejs');


//use routes with /api 
app.use('/', routes);


//Allow react router to handle the get requests
app.get('/*', function(req, res) {
	res.render('index',{ scripts: scripts });
});


//
app.listen(4000, function () {
	console.log('App listening on port 4000!');
});
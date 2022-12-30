// first intall express with command: 
// npm install express --save
/*
Express.js is a node.js package to route http requests
enabled by require function:
*/
var express = require('express');
var app = express(); // creates express app

var fs = require("fs"); // enables fs (File System) module

// body-parser module is used to parse body in http requests to js objects
var bodyParser = require('body-parser');

// we'll use controller to routes to controller that handles spesific routes
var sensorController = require('./sensorController');

// these must be required also
const http = require('http');
const url = require('url');

const hostname = '127.0.0.1'; // ip address of computer running this code = localhost
// we can define port here. 80 is default html port, 243 for https.
// You can also use environment variables to define port
// https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html
const port = process.env.PORT || 3000; // I ususally use 3000 or something like this for demo 


//CORS middleware
var allowCrossDomain = function (req, res, next) {
    // Allowing access from all the locations add following row
    // replace * with ip-addressess when you want to limit who can access your server
    res.header('Access-Control-Allow-Origin', '*');
    // If we want to enable CRUD-methods
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next(); // not sure what this does. It was required
}
// Enable CORS rules:
app.use(allowCrossDomain);

// enable body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // that can handle json


// Static files can be added to public folder. There can be pictures, css-files for ui, js-files for ui
app.use(express.static('public'));

// Routes //

// "root"
// if we don't have index.html in public folder 
// we can define default route manually
// this routes get method request done to address
// http://127.0.0.1:3000/
app.get('/', function(request, response){ // default document
    response.statusCode = 200; // or response.status(200);
    response.setHeader('Content-Type', 'text/html'); // we can define headers manually
    response.end("<h1>Hello World</h1>");  
});

// http://127.0.0.1:3000/one
app.get("/one", function(req, res){
    // by default headers are based on type
    res.sendFile('public/first.html', {root: __dirname });
});
// http://127.0.0.1:3000/two
app.get("/two", function(req, res){
    // by default headers are based on type
    res.sendFile('test.html', {root: __dirname });
});

// we can also use routes
app.route('/measurement')
    .get(sensorController.fetchMeasurements)
    .post(sensorController.addMeasurement);

app.route('/measurement/:id')
    .get(sensorController.fetchSingleMeasurement)
    .put(sensorController.updateMeasurement)
    .delete(sensorController.deleteMeasurement);

app.route('/device')
    .get(sensorController.fetchDevice)
    .post(sensorController.addDevice);

app.route('/location')
    .get(sensorController.fetchLocation)
    .post(sensorController.addLocation);

app.listen(port, hostname, () => {
    console.log(`Server running AT http://${hostname}:${port}/`);
});

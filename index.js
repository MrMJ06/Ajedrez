/**
 * Modules
 */

var express = require('express');
var path = require('path');

/**
 * Variables initialization
 */

var app = express();
var port = 8080;
var path = path.join(__dirname,"/public/index.html");


/**
 * Database configuration
 */




/**
 * Server configuration
 */

app.use(express.static(__dirname+"/public"));

app.get('/', function(request, response){
    console.log(path);
    response.sendFile(path);
});

app.listen(port, function(){
    console.log("Listening port %d", port);
});
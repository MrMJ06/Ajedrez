/**
 * Modules
 */

var express = require('express');

/**
 * Variables initialization
 */

var app = express();
var port = 8080;

/**
 * Server configuration
 */

app.use(express.static(__dirname+"/public"));
app.use("/scripts",express.static(__dirname+"/node_modules/bootstrap/dist"));
app.use("/scripts",express.static(__dirname+"/node_modules/jquery/dist"));
app.use("/scripts",express.static(__dirname+"/node_modules/html2canvas/dist"));

// app.get('/', function(request, response){
//     console.log(__dirname + '/index.html');
//     response.sendFile(__dirname + '/index.html');
// });
// app.get('/games', function(request, response){
//     console.log(__dirname+"/public/games.html");
//     response.sendFile(__dirname+"/public/games.html");
// });
// app.get('/create', function(request, response){
//     console.log(__dirname+"/public/createGame.html");
//     response.sendFile(__dirname+"/public/createGame.html");
// });

app.listen(port, function(){
    console.log("Listening port %d", port);
});
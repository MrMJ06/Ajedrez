/**
 * Modules
 */

var express = require('express');
var expressPeerServer = require('peer').ExpressPeerServer;

/**
 * Variables initialization
 */

var app = express();
var port = 8080;

var server = app.listen(port, function(){
    console.log("Listening port %d", port);
});

var options = {
    debug: true
}
/**
 * Server configuration
 */

app.use(express.static(__dirname+"/public"));
app.use("/scripts",express.static(__dirname+"/node_modules/bootstrap/dist"));
app.use("/scripts",express.static(__dirname+"/node_modules/jquery/dist"));
app.use("/scripts",express.static(__dirname+"/node_modules/html2canvas/dist"));
app.use("/api",expressPeerServer(server, options));
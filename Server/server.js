/*
* server.js
* Created by Brandon Tennant on 12-01-01.
* Copyright (c) 2012 Brandon Tennant. All rights reserved.
*
* Description - Simple ping server: 
* - Sends the connected client a series of messages which are logged with time stamp
* - Client sends ACK for each message set by server to calculate round trip time and success rate
* - Client sends arbitrary payload in ACK but should include the transport mechanism to aid debugging (3G, EDGE, WIFI)
*/

var net = require('net');
var fs = require('fs');
var logFileStream = fs.createWriteStream('/tmp/node_server_log.txt', {'flags': 'a'});
var pingIntervalId = setInterval(pingOpenConnections, 1000);
var pingCounter;
var connections = [];

var server = net.createServer(function(socket) {
    var date = new Date();
    pingCounter = 1;
    connections.push(socket);
    socket.write('Echo server start: ' + date + '\n');
    socket.setKeepAlive(true, 2000);

    socket.on('connect', function() {
        console.log(socket.remoteAddress + ' Socket connect');
        logString(socket.remoteAddress + ' Socket connect');
    })

    socket.on('data', function(data) {
        //console.log(data);
        logString(socket.remoteAddress + ' Socket received: ' + data);
    })
    
    socket.on('end', function() {
        //console.log('Socket end');
        logString('Socket end');
        removeSocketFromList(socket);
    })
    
    socket.on('timeout', function() {
        //console.log('Socket timeout');
        logString('Socket timeout');
    })

    socket.on('drain', function() {
        //console.log('Socket drain');
        logString('Socket drain');
    })

    socket.on('error', function(exception) {
        //console.log('Socket error' + exception);
        logString('Socket error' + exception);
    })

    socket.on('close', function(had_error) {
        console.log('Socket close with error: ' + had_error);
        logString('Socket close with error: ' + had_error);
        removeSocketFromList(socket);
    })
});

server.listen(8000);

function logString(message)
{
    logFileStream.write(new Date() + '\t' + message + '\n');
}

function pingOpenConnections()
{
    for(i = 0; i < connections.length; i++) {
        var aSocket = connections[i];
        writePingToSocket(aSocket);
    }
}

function writePingToSocket(socket) 
{
    //console.log('writePingToSocket ' + pingCounter);
    socket.write(new Date() + '\t' + pingCounter + '\n\0');
    logString(''+ pingCounter + '');
    pingCounter++;
}

function removeSocketFromList(socket)
{
    var index = connections.indexOf(socket);
    if(index >= 0) {
        connections.splice(index, 1);
    }

    console.log('removeSocketFromList at index: ' + index + ' new count: ' + connections.length);
}

function clearPingCounter()
{
    //console.log('clearPingCounter');
    clearInterval(pingIntervalId);
    pingCounter = 1;
}
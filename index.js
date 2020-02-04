var express = require('express');
var socket = require('socket.io');
var app = express();
var server = app.listen(400,function () {
    console.log("listening 400");
});

app.use(express.static('public'));

var io = socket(server);

io.on('connection',function (socket) {
    console.log(socket.id);
    socket.on('box', function (data) {
        socket.broadcast.emit('box',data);
        console.log(data.boxnum);
    })
});
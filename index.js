var express = require('express');
var socket = require('socket.io');
var app = express();
var server = app.listen(400,function () {
    console.log("listening 400");
});

app.use(express.static('public'));

var io = socket(server);

io.on('connection',function (socket) {
    socket.broadcast.emit('opid',{
        opid: socket.id
    });
    socket.on('sendid', function (data) {
        socket.broadcast.to(data.opid).emit('opid',{
            opid: socket.id
        });
    });

    socket.on('box', function (data) {
        socket.broadcast.to(data.opid).emit('box',data);
        console.log(data.boxnum);
    });

});
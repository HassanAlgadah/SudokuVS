const express = require('express');
const socket = require('socket.io');
const app = express();
const server = app.listen(400,()=> console.log("listening 400"));

app.use(express.static('public'));

let io = socket(server);

io.on('connection',(socket)=> {
    socket.broadcast.emit('opid',{
        opid: socket.id
    });
    socket.on('sendid',(data)=> {
        socket.to(data.opid).emit('opid',{
            opid: socket.id
        });
    });
    socket.on('box', (data)=> socket.to(data.opid).emit('box',data));
});
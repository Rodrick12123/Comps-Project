const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let rooms = 0;

app.use(express.static('.'));

// Send player to home.html to start
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

io.on('connection', (socket) => {

    // Create a new game room and notify the creator of game.
    socket.on('createGame', (data) => {
        socket.join(`room-${++rooms}`);
        socket.emit('newGame', { name: data.name, room: `room-${rooms}` });
    });

    // Connect additional players to the room they requested. Show error if room full.
    socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        var numPlayers = 1
        if (room && room.length <= 5) {
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('player1', {});
            ++numPlayers
            socket.emit('player ' + numPlayers, { name: data.name, room: data.room })
        } else {
            socket.emit('err', { message: 'Sorry, The room is full!' });
        }
    });

    /**
       * Handle the end of a round and notify players.
       */
     socket.on('roundOver', (data) => {
        socket.broadcast.to(data.room).emit('roundFinished', {
            tile: data.tile,
            room: data.room
        });
    });

});

server.listen(process.env.PORT || 5000);
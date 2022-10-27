var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var rooms = 0;


/* Setting up the Server */
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile('/home.html', {root: __dirname});
})


/* Game Constants */
const maxPlayers = 8;
const minPlayers = 3;

const numRounds = 5;
const drawingTimer = 60;
const typeTimer = 30;





/* Looks for the correct port number that the server is on */
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});


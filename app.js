


var express = require('express');
const { SocketAddress } = require('net');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var numRounds = 5;
var numPlayers = 0;
var maxPlayers = 8; //Will be in game object


/* Setting up the Server */
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile('public/betasCombined.html', {root: __dirname});
})


const Game = require("./public/javascript/Game.js");
const Player = require("./public/javascript/Player.js");
const Book = require("./public/javascript/Book.js");
const Page = require("./public/javascript/Page.js");


const games = [];
function createGame() {
    let lobbyID = Math.floor(Math.random() * (Math.floor(99999) - Math.ceil(10000) + 1)) + Math.ceil(10000);

    let currGame = new Game(lobbyID);
    games.push(currGame);

    return lobbyID;
}


/* Helper Function:
Creates the new Page objects for the given Book based on the number of rounds */
function createPages(book){
    for (let i = 0; i < numRounds; i++){
        let currPage = new Page();
        book.addPage(currPage);
    }
}


/* Helper Function:
Creates the new Book object for the given player */
function createBook(game, player){
    let currBook = new Book();
    player.setStartBook(currBook);
    game.addBook(currBook);

    createPages(currBook);
}


/* Helper Function:
Creates the new Player object with the given username */
function createPlayer(game, username, lobbyID){
    numPlayers += 1;
    
    if (username == ''){
        username = "Player " + numPlayers;
    }
    //need a new player object for the username and assign their book
    
    let currPlayer = new Player(numPlayers, username, lobbyID);
    game.addPlayer(currPlayer);

    createBook(game, currPlayer);
}


io.on('connection', function(socket){

	/* Create game server functionality 
    No new player is added to the lobby
    This is done on an outside device (Main Screen) */
    socket.on('createClicked', function(){
        lobbyID = createGame();
        console.log(lobbyID);

        // Make the home screen the correct html
        socket.emit('roomCreated', lobbyID);
    });


    /* Join Game server functionality */
    socket.on('joinClicked', function(username, lobbyID){//comes from the input on the html file
        /* check if room exists
        create the player object needs to make sure the username is not already used
        adjust the game object: could be a helper function
        emit to send this person to a waiting room html */
        lobbyID = lobbyID.trim();
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                if (numPlayers >= maxPlayers){
                    socket.emit("tooManyPlayers");
                }
                
                if (games[i].getCurrRound > 0){
                    socket.emit("gameInProgress");
                }

                if (username == ''){
                    username = "Player " + (numPlayers+1);
                }
                
                createPlayer(games[i], username, lobbyID);
                
                socket.join(lobbyID);

                console.log(games[i].players);
                socket.emit('playerToWaitingRoom', games[i].players);
                break;
            }
        }
    });

    socket.on('startGameClicked', function(username, lobbyID){
        lobbyID = lobbyID.trim();
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                // 2 is minPlayers placeholder
                if (numPlayers >= 2){
                    io.in(lobbyID).emit("playerToPrompt");
                    break;
                }
            }
        }
    });

    socket.on('promptEntered', function(username, lobbyID){
        socket.emit('playerToCanvas', games[i].players);
    });

});


/* Looks for the correct port number that the server is on */
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});


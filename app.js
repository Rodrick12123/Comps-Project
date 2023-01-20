


var express = require('express');
const { SocketAddress } = require('net');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var numRounds = 5;
var maxPlayers = 8; //Will be in game object


/* Setting up the Server */
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile('public/betasCombined.html', {root: __dirname});
})


const Game = require("./public/javascript/Game.js");
const Host = require("./public/javascript/Host.js");
const Player = require("./public/javascript/Player.js");
const Book = require("./public/javascript/Book.js");
const Page = require("./public/javascript/Page.js");
const { finished } = require('stream');


const games = [];
function createGame(socketID) {
    let lobbyID = (Math.floor(Math.random() * (Math.floor(99999) - Math.ceil(10000) + 1)) + Math.ceil(10000));

    let host = new Host();
    let currGame = new Game(lobbyID, host, socketID);
    games.push(currGame);
    console.log(games);

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
    player.setCurrentBook(currBook);
    game.addBook(currBook);

    createPages(currBook);
}

/* Helper Function:
Swaps Book objects among players */
function swapBooks(game){
    newBook = game.getPlayerByName(game.players[0].username).getCurrentBook();
    for (let i = 1; i < game.numPlayers; i++){
        oldBook = game.getPlayerByName(game.players[i].username).getCurrentBook();
        game.getPlayerByName(game.players[i].username).setCurrentBook(newBook);
        newBook = oldBook;
    }
    game.getPlayerByName(game.players[0].username).setCurrentBook(newBook);
}


/* Helper Function:
Creates the new Player object with the given username */
function createPlayer(game, username, lobbyID, socketID){
    if (username == ''){
        username = "Player " + game.numPlayers++;
    }
    //need a new player object for the username and assign their book
    
    let currPlayer = new Player(game.numPlayers, username, lobbyID, socketID);
    game.addPlayer(currPlayer);

    if (game.numPlayers >= 2) {
        game.host.setReadyToStart(true);
    }

    createBook(game, currPlayer);
}


io.on('connection', function(socket){

	/* Create game server functionality 
    No new player is added to the lobby
    This is done on an outside device (Main Screen) */
    socket.on('createClicked', function(socketID){
        lobbyID = createGame(socketID);
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
                if (games[i].numPlayers >= maxPlayers){
                    socket.emit("tooManyPlayers");
                }
                
                if (games[i].getCurrRound() > 0){
                    socket.emit("gameInProgress");
                }

                if (username == ''){
                    username = "Player " + (games[i].numPlayers+1);
                }
                
                createPlayer(games[i], username, lobbyID, socket.id);
                
                socket.join(lobbyID);

                console.log(games[i].players);
                io.emit('addPlayerToWaitingList', games[i].players);
                io.to(socket.id).emit('playerToWaitingRoom');
                break;
            }
        }
    });

    socket.on('startGameClicked', function(socketID){
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                if (games[i].host.getReadyToStart()) {
                    games[i].setCurrRound(0)
                    socket.broadcast.emit("playerToPrompt");
                    socket.emit("mainToPrompt");
                    break;
                }
                else {
                    console.log("Not ready to start.");
                }
            }
        }
    });

    socket.on('promptEntered', function(username, lobbyID, prompt){
        console.log(prompt)
        lobbyID = lobbyID.trim();
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                games[i].numPlayersInWaitRoom++;
                playerNum = 0;
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (games[i].players[j].socketID == socket.id){
                        games[i].addPlayerToFinishedPlayers(games[i].players[j].username);
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(prompt);
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setWhoInputted(username);
                        playerNum = j;
                        break;
                    }
                }
                
                if (games[i].numPlayersInWaitRoom == games[i].numPlayers){
                    swapBooks(games[i]);
                    games[i].setCurrRound(games[i].getCurrRound()+1);
                    socket.emit('setPage', games[i].getPlayerByName(games[i].players[playerNum].username).username);
                    io.in(lobbyID).emit("playerToCanvas");
                    io.to(games[i].socketID).emit("mainToCanvas");
                    games[i].numPlayersInWaitRoom = 0;
                    games[i].finishedPlayers = [];
                    break;
                }
                else{
                    io.emit('addPlayerToFinishedList', games[i].finishedPlayers, games[i].usernames);
                    io.to(games[i].socketID).emit("mainPromptFinishedList", games[i].finishedPlayers, games[i].usernames);
                    socket.emit('setPage', games[i].getPlayerByName(games[i].players[playerNum].username).username);
                    io.to(socket.id).emit('playerToWaitingNextRound');
                    break;
                }
            }
        }
    });

    socket.on('canvasEntered', function(username, lobbyID, drawing){
        lobbyID = lobbyID.trim();
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                games[i].numPlayersInWaitRoom++;
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (games[i].players[j].socketID == socket.id){
                        games[i].addPlayerToFinishedPlayers(games[i].players[j].username);
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(drawing);//.toString());
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setWhoInputted(username);
                        break;
                    }
                }
                if (games[i].numPlayersInWaitRoom >= games[i].numPlayers){
                    swapBooks(games[i]);
                    games[i].setCurrRound(games[i].getCurrRound()+1);
                    io.in(lobbyID).emit("playerToPrompt");
                    io.to(games[i].socketID).emit("mainToPrompt");
                    games[i].numPlayersInWaitRoom = 0;
                    games[i].finishedPlayers = [];
                    break;
                }
                else{
                    io.emit('addPlayerToFinishedList', games[i].finishedPlayers, games[i].usernames); // All the players are already in this list so it tries to display them all
                    io.to(games[i].socketID).emit("mainCanvasFinishedList", games[i].finishedPlayers, games[i].usernames);
                    io.to(socket.id).emit('playerToWaitingNextRound');
                    break;
                }
            }
        }
    });

    socket.on("getPlayerNames", function(players) {
        //could maybe have player array at the top of the class
        var playerNames = [];
        for (let i = 0; i < players.length; i++) {
            playerNames.push(players[i].username);
        }
        io.in(players[0].gameLobbyID).emit("showPlayerNames", playerNames);
    });

});


/* Looks for the correct port number that the server is on */
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});




/* Socket.io setup */
var express = require('express');
const { SocketAddress } = require('net');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* Global variables needed for before we set up the game object */
var numRounds = 5;
var maxPlayers = 9;


/* Setting up the Server */
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile('public/betasCombined.html', {root: __dirname});
})

/* Importing various classes  */
const Game = require("./public/javascript/Game.js");
const Host = require("./public/javascript/Host.js");
const Player = require("./public/javascript/Player.js");
const Book = require("./public/javascript/Book.js");
const Page = require("./public/javascript/Page.js");
const { finished } = require('stream');

/* Array holding all of the games that are running */
const games = [];
/* Helper Function:
    Creates a new game object */
function createGame(socketID) {
    let lobbyID = (Math.floor(Math.random() * (Math.floor(99999) - Math.ceil(10000) + 1)) + Math.ceil(10000));

    let host = new Host();
    let currGame = new Game(lobbyID, host, socketID);
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


/* Establishes the socket.io connection */
io.on('connection', function(socket){

    /*  Handles when a player accidentally disconnects 
        Sends everyone back to beginning page */
    socket.on("disconnect", function() {
        for (i = 0; i < games.length; i++) {
            for (j = 0; j < games[i].numPlayers; j++) {
                if (games[i].players[j].socketID == socket.id && games[i].currRound != games[i].maxRounds) {

                    //// Brain implementation
                    games[i].numPlayers--;
                    let disconnectUsername = games[i].players[j].username;
                    let usernameIndex = games[i].usernames.indexOf(disconnectUsername);
                    let finishedPlayersIndex = games[i].finishedPlayers.indexOf(disconnectUsername);

                    if (games[i].currRound != 1) {
                        let disconnectCurrBook = games[i].players[j].currentBook;
                        let bookToReplaceIndex = usernameIndex;
                        for (let r = 1; r < games[i].currRound; r++) {
                            bookToReplaceIndex++;
                            if (bookToReplaceIndex == games[i].players.length) {
                                bookToReplaceIndex = 0;
                            }
                        }
                        games[i].players[bookToReplaceIndex].currentBook = disconnectCurrBook;
                    }

                    games[i].players.splice(j, 1);

                    if (!games[i].finishedPlayers.includes(disconnectUsername) && 
                    (games[i].finishedPlayers.length == games[i].numPlayers)) {
                        // if canvas round
                        if (games[i].getCurrRound() % 2 == 0) {
                            io.to(games[i].players[0].socketID).emit('enterCanvas', games[i].lobbyID, null);   
                        }
                        // if prompt round
                        else {
                            io.to(games[i].players[0].socketID).emit('enterPrompt', games[i].lobbyID, "");
                        }
                    }
                    games[i].usernames.splice(usernameIndex, 1);
                    games[i].finishedPlayers.splice(finishedPlayersIndex, 1);
                }
            }
        }
    });

	/* Create game server functionality 
    No new player is added to the lobby
    This is done on an outside device (Main Screen) */
    socket.on('createClicked', function(socketID){
        lobbyID = createGame(socketID);

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
                    break;
                }
                
                if (games[i].getCurrRound() > 0){
                    socket.emit("gameInProgress");
                    break;
                }

                if (username == ''){
                    username = "Player " + (games[i].numPlayers+1);
                }
                
                createPlayer(games[i], username, lobbyID, socket.id);
                
                socket.join(lobbyID);

                io.to(games[i].socketID).emit('addPlayerToWaitingList', games[i].players);
                for (j = 0; j < games[i].numPlayers; j++) {
                    io.to(games[i].players[j].socketID).emit('addPlayerToWaitingList', games[i].players);
                }
                io.to(socket.id).emit('playerToWaitingRoom');
                break;
            }
        }
    });

    /* The start game button was clicked on the main screen */
    socket.on('startGameClicked', function(socketID){
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                if (games[i].host.getReadyToStart()) {
                    games[i].setCurrRound(1)
                    games[i].timerStatus = true;
                    for (j = 0; j < games[i].numPlayers; j++) {
                        io.to(games[i].players[j].socketID).emit("playerToPrompt");
                    }
                    socket.emit("mainToPrompt");
                    var startDate = new Date();
                    io.to(games[i].socketID).emit("timerStart", games[i], "start", startDate, lobbyID);
                    break;
                }
                else {
                    console.log("Not ready to start.");
                }
            }
        }
    });

    /* The enter prompt button was clicked on one of the players screens */
    socket.on('promptEntered', function(lobbyID, prompt){
        lobbyID = lobbyID.trim();
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                games[i].numPlayersInWaitRoom++;
                playerNum = 0;
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (games[i].players[j].socketID == socket.id){
                        let rand = Math.floor(Math.random() * games[i].defaultPrompts.length);
                        games[i].addPlayerToFinishedPlayers(games[i].players[j].username);
                        if(String(prompt).length < 1){ 
                            games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(games[i].defaultPrompts[rand]);
                        }else{
                            games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(prompt);
                        }
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setWhoInputted(games[i].players[j].username);
                        playerNum = j;
                        break;
                    }
                }
                
                if (games[i].numPlayersInWaitRoom >= games[i].numPlayers){
                    games[i].timerStatus = false;
                    var startDate = new Date();

                    io.to(games[i].socketID).emit("timerStart", games[i], "prompt", startDate, lobbyID);
                    swapBooks(games[i]);
                    games[i].setCurrRound(games[i].getCurrRound()+1);
                    io.emit('displayPrompt', games[i]);
                    io.in(lobbyID).emit("playerToCanvas");
                    io.to(games[i].socketID).emit("mainToCanvas");

                    games[i].timerStatus = true;
                    startDate = new Date();
                    io.to(games[i].socketID).emit("timerStart", games[i], "prompt", startDate, lobbyID);
                    games[i].numPlayersInWaitRoom = 0;
                    games[i].finishedPlayers = [];
                    
                    break;
                }
                else{
                    io.in(lobbyID).emit('addPlayerToFinishedList', games[i].finishedPlayers, games[i].usernames);
                    io.to(games[i].socketID).emit("mainPromptFinishedList", games[i].finishedPlayers, games[i].usernames);
                    io.to(socket.id).emit('playerToWaitingNextRound');
                    break;
                }
            }
        }
    });

    /* The enter canvas button was clicked on one of the players screens */
    socket.on('canvasEntered', function(lobbyID, drawing){
        if(drawing != null){
            lobbyID = lobbyID.trim();
        }
        
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                games[i].numPlayersInWaitRoom++;
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (games[i].players[j].socketID == socket.id){
                        games[i].addPlayerToFinishedPlayers(games[i].players[j].username);
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(drawing);
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setWhoInputted(games[i].players[j].username);
                        break;
                    }
                }
                if (games[i].numPlayersInWaitRoom >= games[i].numPlayers){
                    games[i].timerStatus = false;
                    
                    var startDate = new Date();

                    io.to(games[i].socketID).emit("timerStart", games[i], "canvas", startDate, lobbyID);
                    swapBooks(games[i]);
                    games[i].setCurrRound(games[i].getCurrRound()+1);
                    io.emit('displayCanvas', games[i]);
                    if (games[i].getCurrRound() >= games[i].maxRounds) {
                        io.in(lobbyID).emit("playersToEndgame");
                        io.to(games[i].socketID).emit("mainToEndgame");
                        io.to(games[i].socketID).emit("putNamesOnBooks", games[i]);
                        break;
                    }
                    io.in(lobbyID).emit("playerToPromptWithCanvas");
                    io.to(games[i].socketID).emit("mainToPrompt");
                    games[i].numPlayersInWaitRoom = 0;
                    games[i].finishedPlayers = [];
                    games[i].timerStatus = true;
                    
                    startDate = new Date();
                    io.to(games[i].socketID).emit("timerStart", games[i], "canvas", startDate, lobbyID);
                    break;
                }
                else{
                    io.in(lobbyID).emit('addPlayerToFinishedList', games[i].finishedPlayers, games[i].usernames); // All the players are already in this list so it tries to display them all
                    io.to(games[i].socketID).emit("mainCanvasFinishedList", games[i].finishedPlayers, games[i].usernames);
                    io.to(socket.id).emit('playerToWaitingNextRound');
                    break;
                }
            }
        }
    });

    /* Functionality for the timer expiring when the players are on the canvas page */
    socket.on("timerFinishedCanvas", function(lobbyID) {
        lobbyID = lobbyID.trim();
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (!(games[i].finishedPlayers.includes(games[i].players[j].username))){
                        io.to(games[i].players[j].socketID).emit('enterCanvas');
                    }
                }

                break;
            }
        }

    });

    /* Functionality for the timer expiring when the players are on the prompt page */
    socket.on("timerFinishedPrompt", function(lobbyID) {
        lobbyID = lobbyID.trim();
        
        for (let i = 0; i < games.length; i++) {
            
            if (games[i].lobbyID == lobbyID){
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (!(games[i].finishedPlayers.includes(games[i].players[j].username))){
                        io.to(games[i].players[j].socketID).emit('enterPrompt');
                    }
                }
                break;
            }
        }
    });

    /* Functionality for when one of the books are clicked on the final results page.
        Done on the main screen. */
    socket.on("bookClicked", function(playerNum, socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[playerNum-1];
                games[i].host.currResultPage += 1; 
                games[i].host.currPlayerBook = playerNum;
                initialPrompt = currPlayer.startBook.pages[games[i].host.currResultPage].input;
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                socket.emit("displayEndGamePrompt", currPlayer, initialPrompt, whoInputted);
            }
        }
    });

    /* The right arrow is clicked when reviewing a prompt page of a book */
    socket.on("promptRightArrowClicked", function(socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[games[i].host.currPlayerBook-1];
                games[i].host.currResultPage += 1;
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                socket.emit("displayEndGameCanvas", games[i], currPlayer, whoInputted);
            }
        }
    });

    /* The left arrow is clicked when reviewing a prompt page of a book */
    socket.on("promptLeftArrowClicked", function(socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[games[i].host.currPlayerBook-1];
                games[i].host.currResultPage -= 1;
                if (games[i].host.currResultPage <= 0) {
                    games[i].host.currResultPage = 0;
                    socket.emit("mainToEndgame");
                    break;
                }
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                socket.emit("displayEndGameCanvas", games[i], currPlayer, whoInputted);
            }
        }
    });

    /* The right arrow is clicked when reviewing a canvas page of a book */
    socket.on("canvasRightArrowClicked", function(socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[games[i].host.currPlayerBook-1];
                games[i].host.currResultPage += 1;
                if (games[i].host.currResultPage >= games[i].maxRounds) {
                    games[i].host.currResultPage = 0;
                    socket.emit("mainToEndgame");
                    break;
                }
                currPrompt = currPlayer.startBook.pages[games[i].host.currResultPage].input;
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                socket.emit("displayEndGamePrompt", currPlayer, currPrompt, whoInputted);
            }
        }
    });

    /* The left arrow is clicked when reviewing a canvas page of a book */
    socket.on("canvasLeftArrowClicked", function(socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[games[i].host.currPlayerBook-1];
                games[i].host.currResultPage -= 1;
                currPrompt = currPlayer.startBook.pages[games[i].host.currResultPage].input;
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                socket.emit("displayEndGamePrompt", currPlayer, currPrompt, whoInputted);
            }
        }
    });

});


/* Looks for the correct port number that the server is on */
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

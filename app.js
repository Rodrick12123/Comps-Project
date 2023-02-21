


var express = require('express');
const { SocketAddress } = require('net');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var numRounds = 5;
var maxPlayers = 9; //Will be in game object


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

    socket.on("disconnect", function() {
        console.log("socket.id: " + socket.id);

        io.emit("jsLog");
        io.emit("htmlLog");
        
        // for (let i = 0; i < games.length; i++) {
        //     for (let j = 0; j < games[i].players.length; j++) {
        //         if (games[i].players[j].socketID == socket.id) {                    
        //             console.log("current round is: " + games[i].getCurrRound());

        //             /// Work in progress – need to figure out how to properly remove player from finishedPlayers list

        //             console.log("player is finished status: " + games[i].finishedPlayers.includes(games[i].players[j].username));
        //             // if disconnected player has not submitted yet
        //             if (!games[i].finishedPlayers.includes(games[i].players[j].username)) {
        //                 // if canvas round
        //                 if (games[i].getCurrRound() % 2 == 0) {
        //                     console.log("entering canvas");
        //                     // io.to(games[i].players[j].socketID).emit('enterCanvas'); // If player hasn't submitted canvas, submit
        //                     socket.emit("canvasEntered", games[i].players[j].username, games[i].lobbyID, null);
        //                 }
        //                 // if prompt round
        //                 else {
        //                     console.log("entering prompt");
        //                     // io.to(games[i].players[j].socketID).emit('enterPrompt'); // If player hasn't submmited prompt, submit
        //                     socket.emit("promptEntered", games[i].players[j].username, games[i].lobbyID, null);
        //                 }

        //                 console.log("1. number of players in wait room: " + games[i].numPlayersInWaitRoom);
        //                 console.log("1. games.numPlayers: " + games[i].numPlayers);

        //             }
        //             else {
        //                 for (let k = 0; k < games[i].finishedPlayers; k++) {
        //                     if (games[i].finishedPlayers[k] == games[i].players[j].username) {
        //                         games[i].finishedPlayers.splice(k, 1);
        //                     }
        //                 } 
        //             }
                    
        //             // disconnect player from game lists
        //             games[i].disconnectPlayer(socket.id);

        //             console.log("2. number of players in wait room: " + games[i].numPlayersInWaitRoom);
        //             console.log("2. games.numPlayers: " + games[i].numPlayers);

        //             /// Because I can't make the promptEntered work, here I'm trying to trigger the conditional manually to
        //             /// send the game to the next state if this player was the last player to have a prompt/canvas
        //             if (games[i].numPlayersInWaitRoom >= games[i].numPlayers){
        //                 if (games[i].getCurrRound() % 2 == 0) {

        //                     games[i].timerStatus = false;
        //                     var startDate = new Date();

        //                     io.to(games[i].socketID).emit("timerStart", games[i], "canvas", startDate, games[i].lobbyID);
        //                     swapBooks(games[i]);
        //                     games[i].setCurrRound(games[i].getCurrRound()+1);
        //                     io.emit('displayCanvas', games[i]);

        //                     if (games[i].getCurrRound() >= games[i].maxRounds) {
        //                         io.in(lobbyID).emit("playersToEndgame");
        //                         io.to(games[i].socketID).emit("mainToEndgame");
        //                         io.to(games[i].socketID).emit("putNamesOnBooks", games[i]);
        //                         break;
        //                     }

        //                     console.log("trying to emit playerToPromptWithCanvas to lobby id : " + games[i].lobbyID);
        //                     io.in(games[i].lobbyID).emit("playerToPromptWithCanvas");
        //                     io.to(games[i].socketID).emit("mainToPrompt");

        //                     games[i].numPlayersInWaitRoom = 0;
        //                     games[i].finishedPlayers = [];
        //                     games[i].timerStatus = true;

        //                     startDate = new Date();
        //                     io.to(games[i].socketID).emit("timerStart", games[i], "canvas", startDate, games[i].lobbyID);
        //                 }

        //                 else {
        //                     games[i].timerStatus = false;
        //                     var startDate = new Date();

        //                     io.to(games[i].socketID).emit("timerStart", games[i], "prompt", startDate, games[i].lobbyID);
        //                     io.emit("timerStart", games[i], "prompt", startDate, games[i].lobbyID);
        //                     swapBooks(games[i]);
        //                     games[i].setCurrRound(games[i].getCurrRound()+1);
        //                     io.emit('displayPrompt', games[i]);
                            
        //                     console.log("trying to emit playerToCanvas to lobby id : " + games[i].lobbyID);
        //                     io.in(games[i].lobbyID).emit("playerToCanvas");
        //                     io.to(games[i].socketID).emit("mainToCanvas");
        
                            
        //                     startDate = new Date();
        //                     io.to(games[i].socketID).emit("timerStart", games[i], "prompt", startDate, games[i].lobbyID);

        //                     games[i].timerStatus = true;
        //                     games[i].numPlayersInWaitRoom = 0;
        //                     games[i].finishedPlayers = [];
        //                 }
        //             }

        //             // should re-emit finished players without the disconnected player –– work in progress
        //             io.emit('addPlayerToFinishedList', games[i].finishedPlayers, games[i].usernames);
        //             if (games[i].getCurrRound() % 2 == 0) {
        //                 io.to(games[i].socketID).emit("mainCanvasFinishedList", games[i].finishedPlayers, games[i].usernames);
        //             }
        //             else {
        //                 io.to(games[i].socketID).emit("mainPromptFinishedList", games[i].finishedPlayers, games[i].usernames);
        //             }
        //         }
        //     }
        // }

        /* TODO List: 
            be able to end the round (send players in waiting room on)
            remove that player from the list of unfinished players HTML
            What about their book????*/

        console.log("player disconnected");
    });

    socket.on("jsLog", function() {
        console.log("we are here\n\n\n\n");
    });

    socket.on("wow", function() {
        console.log("we are ionwvdosnboswbo\n\n\n\n");
    });

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
                var prompt1 = "Make the monkey laugh";
                var prompt2 = "Houston we have takeoff";
                var prompt3 = "The roof the roof the roof is on fire";
                var prompt4 = "Make me laugh";
                var prompt5 = "Dancing in the rain";
                var prompt6 = "How about them apples";
                var prompt7 = "She's a bad mamba jamba";
                var prompt8 = "Its a bird its a plane."
                var prompt9 = "Up up and away."
                var prompt10 = "Fast and furious"

                games[i].addPrompt(prompt1);
                games[i].addPrompt(prompt2);
                games[i].addPrompt(prompt3);
                games[i].addPrompt(prompt4);
                games[i].addPrompt(prompt5);
                games[i].addPrompt(prompt6);
                games[i].addPrompt(prompt7);
                games[i].addPrompt(prompt8);
                games[i].addPrompt(prompt9);
                games[i].addPrompt(prompt10);
                
                console.log(games[i].defaultPrompt);
                if (games[i].numPlayers >= maxPlayers){
                    socket.emit("tooManyPlayers");
                    break;
                }
                
                if (games[i].getCurrRound() > 0){
                    if (games[i].hasDisconnectedPlayers()) {
                        games[i].reconnectPlayer(username);
                        socket.join(lobbyID);

                        // if currRound is odd, send to prompt page
                        // else if currRound is even, send to canvas page
                    
                        // emit something to send to right page
                        // console.log()
                    }
                    else {
                        socket.emit("gameInProgress");
                    }
                    break;
                }

                if (username == ''){
                    username = "Player " + (games[i].numPlayers+1);
                }
                
                createPlayer(games[i], username, lobbyID, socket.id);
                
                socket.join(lobbyID);

                //console.log(games[i].players);
                io.to(games[i].socketID).emit('addPlayerToWaitingList', games[i].players)
                for (j = 0; j < games[i].numPlayers; j++) {
                    io.to(games[i].players[j].socketID).emit('addPlayerToWaitingList', games[i].players);
                }
                io.to(socket.id).emit('playerToWaitingRoom');
                break;
            }
        }
    });

    socket.on('startGameClicked', function(socketID){
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                if (games[i].host.getReadyToStart()) {
                    games[i].setCurrRound(1)
                    games[i].timerStatus = true;
                    // console.log(games[i].timerStatus);
                    // console.log('games[i].timerStatus');
                    for (j = 0; j < games[i].numPlayers; j++) {
                        io.to(games[i].players[j].socketID).emit("playerToPrompt");
                    }
                    socket.emit("mainToPrompt");
                    //change
                    var startDate = new Date();
                    //io.to(games[i].socketID).emit("timerStart", games[i], "start", startDate);
                    io.to(games[i].socketID).emit("timerStart", games[i], "start", startDate, lobbyID);
                    //io.in(lobbyID).emit("timerStart", games[i], "start", startDate);
                    break;
                }
                else {
                    console.log("Not ready to start.");
                }
            }
        }
    });


    socket.on('promptEntered', function(username, lobbyID, prompt){
        console.log("promptEntered called");
        console.log("entered" , prompt);
        lobbyID = lobbyID.trim();
        let rand = Math.floor(Math.random() * 9);
        var p = String(prompt);
        console.log(p.length);
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                games[i].numPlayersInWaitRoom++;
                playerNum = 0;
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (games[i].players[j].socketID == socket.id){
                        games[i].addPlayerToFinishedPlayers(games[i].players[j].username);
                        if(p.length <= 1){
                            
                            games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(games[i].defaultPrompt[rand]);
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
                    //figure out what page dis add parameter
                    io.to(games[i].socketID).emit("timerStart", games[i], "prompt", startDate, lobbyID);
                    //io.emit("timerStart", games[i], "prompt", startDate);

                    swapBooks(games[i]);
                    games[i].setCurrRound(games[i].getCurrRound()+1);
                    io.emit('displayPrompt', games[i]);
                    //use this for timer
                    io.in(lobbyID).emit("playerToCanvas");
                    io.to(games[i].socketID).emit("mainToCanvas");

                    games[i].timerStatus = true;
                    startDate = new Date();
                    //console.log(startDate, 'out');
                    io.to(games[i].socketID).emit("timerStart", games[i], "prompt", startDate, lobbyID);
                    //io.emit("timerStart", games[i], "prompt", startDate);
                    games[i].numPlayersInWaitRoom = 0;
                    games[i].finishedPlayers = [];
                    
                    break;
                }
                else{
                    io.emit('addPlayerToFinishedList', games[i].finishedPlayers, games[i].usernames);
                    io.to(games[i].socketID).emit("mainPromptFinishedList", games[i].finishedPlayers, games[i].usernames);
                    io.to(socket.id).emit('playerToWaitingNextRound');
                    break;
                }
            }
        }
    });

    socket.on('canvasEntered', function(username, lobbyID, drawing){
        console.log("canvasEntered called");

        if(drawing != null){
            lobbyID = lobbyID.trim();
        }
        
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                games[i].numPlayersInWaitRoom++;
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (games[i].players[j].socketID == socket.id){
                        games[i].addPlayerToFinishedPlayers(games[i].players[j].username);
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(drawing);//.toString());
                        games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setWhoInputted(games[i].players[j].username);
                        break;
                    }
                }
                if (games[i].numPlayersInWaitRoom >= games[i].numPlayers){
                    games[i].timerStatus = false;
                    
                    var startDate = new Date();
                    //figure out what page dis add parameter
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
                    //console.log(startDate, 'out');
                    io.to(games[i].socketID).emit("timerStart", games[i], "canvas", startDate, lobbyID);
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

    socket.on("timerFinishedCanvas", function(lobbyID) {
        console.log("there")
        lobbyID = lobbyID.trim();
        for (let i = 0; i < games.length; i++) {
            if (games[i].lobbyID == lobbyID){
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (!(games[i].finishedPlayers.includes(games[i].players[j].username))){
                        io.to(games[i].players[j].socketID).emit('enterCanvas');
                        //games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput("No drawing");//.toString());
                        //games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setWhoInputted(games[i].players[j].username);
                    }
                }

                break;
            }
        }

    });


    socket.on("timerFinishedPrompt", function(lobbyID) {
        lobbyID = lobbyID.trim();
        
        for (let i = 0; i < games.length; i++) {
            
            if (games[i].lobbyID == lobbyID){
                for(let j = 0; j < games[i].numPlayers; j++){
                    if (!(games[i].finishedPlayers.includes(games[i].players[j].username))){
                        io.to(games[i].players[j].socketID).emit('enterPrompt');
                        
                        
                        //games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setStringInput(prompt);
                        //games[i].getPlayerByName(games[i].players[j].username).getCurrentBook().pages[games[i].getCurrRound()].setWhoInputted(games[i].players[j].username);
                    }
                }
                break;
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

    socket.on("bookClicked", function(playerNum, socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[playerNum-1];
                games[i].host.currResultPage += 1; 
                console.log("page " + games[i].host.currResultPage);
                games[i].host.currPlayerBook = playerNum;
                initialPrompt = currPlayer.startBook.pages[games[i].host.currResultPage].stringInput;
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                console.log(whoInputted + "x");
                socket.emit("displayEndGamePrompt", currPlayer, initialPrompt, whoInputted);
            }
        }
    });

    socket.on("promptRightArrowClicked", function(socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[games[i].host.currPlayerBook-1];
                games[i].host.currResultPage += 1;
                console.log("page " + games[i].host.currResultPage);
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                console.log(whoInputted + "x");
                socket.emit("displayEndGameCanvas", games[i], currPlayer, whoInputted);
            }
        }
    });

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
                console.log("page " + games[i].host.currResultPage);
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                socket.emit("displayEndGameCanvas", games[i], currPlayer, whoInputted);
            }
        }
    });

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
                console.log("page " + games[i].host.currResultPage);
                currPrompt = currPlayer.startBook.pages[games[i].host.currResultPage].stringInput;
                whoInputted = currPlayer.startBook.pages[games[i].host.currResultPage].whoInputted;
                socket.emit("displayEndGamePrompt", currPlayer, currPrompt, whoInputted);
            }
        }
    });

    socket.on("canvasLeftArrowClicked", function(socketID) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].socketID == socketID){
                currPlayer = games[i].players[games[i].host.currPlayerBook-1];
                games[i].host.currResultPage -= 1;
                console.log("page " + games[i].host.currResultPage);
                currPrompt = currPlayer.startBook.pages[games[i].host.currResultPage].stringInput;
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

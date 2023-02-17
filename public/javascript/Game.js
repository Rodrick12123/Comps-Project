
/* Our main game Object */
class Game {
    constructor(lobbyID, host, socketID) {
        this.lobbyID = lobbyID;
        this.socketID = socketID;
        this.currRound = 0;
        this.maxRounds = 1;
        this.numPlayers = 0;
        this.numPlayersInWaitRoom = 0;
        this.players = [];
        this.usernames = [];
        this.finishedPlayers = [];
        this.books = [];
        this.drawTime = 60;
        this.guessTime = 30;
        this.timerStatus = false;
        this.host = host;
        this.numPlayersInWaitRoom = 0;
        this.disconnectedPlayers = [];
    }


    /* Appends the player to the list of players */
    addPlayer(player) {
        this.players.push(player);
        this.numPlayers++;
        this.usernames.push(player.username);
    }


    /* Appends the player to the list of players */
    addPlayerToFinishedPlayers(username) {
        this.finishedPlayers.push(username);
    }

    // Adds player to disconnectedPlayers and removes player from players
    disconnectPlayer(socketID) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].socketID == socketID) {
                console.log("removing player: " + this.players[i].username);
                this.disconnectedPlayers.push(this.players[i]); // add player to disconnectedPlayers[]
                this.players.splice(i, 1); // remove the player from players list
                this.usernames.splice(i,1);
            }
        }

        this.numPlayers--;
        // remove player username from usernames[]

        // console.log("current players: " + this.displayPlayers());
        console.log("current players length: " + this.players.length);
        // console.log("current disconnected players: " + this.displayDisconnectedPlayers());
        console.log("current disconnected players: " + this.disconnectedPlayers.length);
    }

    // Let's player join any game lobby that already has >0 disconnections during the game
    // and reconnects the player to the game
    reconnectPlayer(username, socketID) {
        if (this.disconnectedPlayers.length > 0) {
            var newPlayer = this.disconnectedPlayers[0];
            this.disconnectedPlayers.splice(0, 1);
        }
        else {
            console.log("Error: no player has been disconnected during the game");
        }
        newPlayer.username = username; // update player's username
        newPlayer.socketID = socketID;
        this.addPlayer(newPlayer);
        console.log("player reconnecting: " + newPlayer.username);
    
        // might need to handle interactions with the re-added player's book object not 
        // corresponding with current game state
    }

    /* Appends the book to the list of books */
    addBook(book) {
        this.books.push(book);
    }


    // Gets timer status
    getTimer(){
        return this.timerStatus;
    }

    //Probably want get functions for these variables
    /* get function for the current round 
    Used to check if the game is started and when it should finish */
    getCurrRound(){
        return this.currRound;
    }

    /* get function for the current round */
    setCurrRound(round){
        return this.currRound = round;
    }

    getPlayerByName(name){
        for(let i=0; i<this.numPlayers; i++){
            if(this.players[i].username==name){
                return this.players[i];
            }
        }
    }

    hasDisconnectedPlayers() {
        if (this.disconnectedPlayers.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    displayPlayers() {
        for(let i=0; i<this.players.length; i++) {
            console.log(this.players[i].username);
        }
    }

    displayDisconnectedPlayers() {
        for(let i=0; i<this.disconnectedPlayers.length; i++) {
            console.log(this.disconnectedPlayers[i]);
        }
    }

}

module.exports = Game;
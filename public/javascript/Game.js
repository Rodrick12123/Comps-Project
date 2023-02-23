
/* Our main game Object */
class Game {
    constructor(lobbyID, host, socketID) {
        this.lobbyID = lobbyID;
        this.socketID = socketID;
        this.currRound = 0;
        this.maxRounds = 5;
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
        this.defaultPrompts = ["Make the monkey laugh", "Houston we have takeoff", "The roof the roof the roof is on fire",
        "Make me laugh", "Dancing in the rain", "How about them apples", "She's a bad mamba jamba", "Its a bird its a plane",
        "Up up and away", "Fast and furious"];
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


    /* Appends the book to the list of books */
    addBook(book) {
        this.books.push(book);
    }


    /* Gets timer status */
    getTimer(){
        return this.timerStatus;
    }

    /* Get function for the current round 
    Used to check if the game is started and when it should finish */
    getCurrRound(){
        return this.currRound;
    }

    /* Set function for the current round */
    setCurrRound(round){
        return this.currRound = round;
    }

    /* Gets a player's username */
    getPlayerByName(name){
        for(let i=0; i<this.numPlayers; i++){
            if(this.players[i].username==name){
                return this.players[i];
            }
        }
    }

}

module.exports = Game;
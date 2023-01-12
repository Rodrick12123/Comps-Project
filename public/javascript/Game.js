
/* Our main game Object */
class Game {
    constructor(lobbyID, host, socketID) {
        this.lobbyID = lobbyID;
        this.socketID = socketID;
        this.currRound = 0;
        this.numPlayers = 0;
        this.players = [];
        this.finishedPlayers = [];
        this.books = [];
        this.drawTime = 60;
        this.guessTime = 30;
        this.host = host;
        this.numPlayersInWaitRoom = 0;
    }


    /* Appends the player to the list of players */
    addPlayer(player) {
        this.players.push(player);
        this.numPlayers++
    }

    /* Appends the book to the list of books */
    addBook(book) {
        this.books.push(book);
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

    // Might want some more methods implemented
}

module.exports = Game;
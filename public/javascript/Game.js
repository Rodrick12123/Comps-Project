
/* Our main game Object */
export class Game {
    constructor(lobbyID) {
        this.lobbyID = lobbyID;
        this.currRound = 0;
        this.numPlayers = 0;
        this.players = [];
        this.books = [];
        this.drawTime = 60;
        this.guessTime = 30;
    }


    /* Appends the player to the list of players */
    addPlayer(player) {
        this.players.append(player);
    }

    /* Appends the book to the list of books */
    addBook(book) {
        this.books.append(book);
    }


    //Probably want get functions for these variables
    /* get function for the current round 
    Used to check if the game is started and when it should finish */
    getCurrRound(){
        return this.currRound;
    }

    // Might want some more methods implemented
}
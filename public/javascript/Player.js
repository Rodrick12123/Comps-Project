
/* Our main Player Object */
export class Player {
    constructor(playerNum, username, lobbyID) {
        this.playerNum = playerNum;
        this.username = username;
        this.startBook;
        this.gameLobbyID = lobbyID;
    }


    /* Sets the book that is assigned to the player */
    setStartBook(book) {
        this.startBook = book;
    }

    //Probably want get functions for these variables

    // Might want some more methods implemented
}
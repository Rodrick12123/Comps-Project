
/* Our main Player Object */
class Player {
    constructor(playerNum, username, lobbyID, socketID) {
        this.socketID = socketID;
        this.playerNum = playerNum;
        this.username = username;
        this.startBook;
        this.gameLobbyID = lobbyID;
        this.currentBook;
    }


    /* Sets the book that is assigned to the player */
    setStartBook(book) {
        this.startBook = book;
    }

    /* Gets the start book that is assigned to the player */
    getStartBook() {
        return this.startBook;
    }

    /* Sets the current book that is assigned to the player */
    setCurrentBook(book) {
        this.currentBook = book;
    }

    /* Gets the current book that is assigned to the player */
    getCurrentBook() {
        return this.currentBook;
    }
    
}

module.exports = Player;
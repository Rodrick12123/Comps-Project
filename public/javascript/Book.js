
/* Our main Book Object */
class Book {
    constructor(playerNum) {
        this.pages = [];
    }


    /* Appends a page to the list of pages for this book */
    addPage(page){
        this.pages.push(page);
    }

    //Probably want get functions for these variables

    // Might want some more methods implemented
}

module.exports = Book;
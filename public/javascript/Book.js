
/* Our main Book Object */
class Book {
    constructor(playerNum) {
        this.pages = [];
        this.haveSeen = false;
    }


    /* Appends a page to the list of pages for this book */
    addPage(page){
        this.pages.push(page);
    }
}

module.exports = Book;
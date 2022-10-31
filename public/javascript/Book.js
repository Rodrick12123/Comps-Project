
/* Our main Book Object */
export class Book {
    constructor(playerNum) {
        this.pages = [];
    }


    /* Appends a page to the list of pages for this book */
    addPage(page){
        this.pages.append(page);
    }

    //Probably want get functions for these variables

    // Might want some more methods implemented
}
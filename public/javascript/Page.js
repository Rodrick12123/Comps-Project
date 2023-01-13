
/* out main Page Object */
class Page {
    constructor() {
        this.whoInputted;
        this.stringInput; //Should it be initializes with the empty string?
        this.drawingInput; //IDK what goes here yet
    }

    /* Sets who inputted the page */
    setWhoInputted(username) {
        this.whoInputted = username;
    }

    /* Gets who inputted the page */
    getWhoInputted() {
        return this.whoInputted;
    }

    /* Sets string input */
    setStringInput(stringInput) {
        this.stringInput = stringInput;
    }

    /* Gets string input */
    getStringInput() {
        return this.stringInput;
    }

    /* Sets string input */
    setDrawingInput(drawingInput) {
        this.stringInput = drawingInput;
    }

    /* Gets string input */
    getDrawingInput() {
        return this.drawingInput;
    }

    //Probably want get functions for these variables

    //Method to set the instance variables

    // Might want some more methods implemented
}

module.exports = Page;
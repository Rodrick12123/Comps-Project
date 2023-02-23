
/* out main Page Object */
class Page {
    constructor() {
        this.whoInputted;
        this.input;
    }

    /* Sets who inputted the page */
    setWhoInputted(username) {
        this.whoInputted = username;
    }

    /* Gets who inputted the page */
    getWhoInputted() {
        return this.whoInputted;
    }

    /* Sets input */
    setStringInput(input) {
        this.input = input;
    }

    /* Gets input */
    getinput() {
        return this.input;
    }

}

module.exports = Page;

/* Our main Host Object for the main screen */
class Host {
    constructor(game) {
        this.game = game;
        this.readyToStart = false;
    }

    setReadyToStart(trueOrFalse){
        this.readyToStart = trueOrFalse;
    }
}

module.exports = Host;
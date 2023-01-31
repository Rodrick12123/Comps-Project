
/* Our main Host Object for the main screen */
class Host {
    constructor() {
        this.readyToStart = false;
        this.currResultPage = 0;
    }

    setReadyToStart(trueOrFalse) {
        this.readyToStart = trueOrFalse;
    }

    getReadyToStart() {
        return this.readyToStart;
    }
}

module.exports = Host;
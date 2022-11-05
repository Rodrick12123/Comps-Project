
// const socket = io();

/* HTML elements */

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(__dirname + "/../betasCombined.html");

const screenViews = {
  mainPage: dom.window.document.getElementById("mainPage"),
  joinPage: dom.window.document.getElementById("joinPage"),
  lobbyPage: dom.window.document.getElementById("lobbyScreen")
};

/* Utility Functions */

function switchView(newViewName){
  console.log("hello");
  for (let [viewName, view] of Object.entries(allViews)) {
    if (viewName === newViewName) {
      view.style.display = 'block';
    } 
    else {
      view.style.display = 'none';
    }
  }
}



/* Game Functionality */

// Create a new game. Emit newGame event.
function createButtonClicked() {
  socket.emit('createClicked');
}

  // Join an existing game on the entered roomId. Emit the joinGame event.
// $('#join').on('click', () => {
//     const name = $('#nameJoin').val();
//     const roomID = $('#room').val();
//     if (!name || !roomID) {
//       alert('Please enter your name and game ID.');
//       return;
//     }
//     socket.emit('joinGame', { name, room: roomID });
//     player = new Player(name, 'P' + numPlayers);
//   });


// socket.on("roomCreated", function(lobbyID) {
//   console.log("yes");
//   switchView("lobbyPage");

//   gameCodeDisplay.value = lobbyId.substring(5, lobbyId.length + 1);
// });

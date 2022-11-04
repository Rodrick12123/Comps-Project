const socket = io.connect('http://localhost:5000');
var numPlayers = 0

// Create a new game. Emit newGame event.
$('#new').on('click', () => {
    const name = $('#nameNew').val();
    if (!name) {
      alert('Please enter your name.');
      return;
    }
    socket.emit('createGame', { name });
    player = new Player(name, P1);
    ++numPlayers
  });

  // Join an existing game on the entered roomId. Emit the joinGame event.
  $('#join').on('click', () => {
    const name = $('#nameJoin').val();
    const roomID = $('#room').val();
    if (!name || !roomID) {
      alert('Please enter your name and game ID.');
      return;
    }
    socket.emit('joinGame', { name, room: roomID });
    player = new Player(name, 'P' + numPlayers);
  });

  // New Game created by current client. Update the UI and create new Game var.
  socket.on('newGame', (data) => {
    const message =
      `Hello, ${data.name}. Please ask your friend to enter Game ID: 
      ${data.room}. Waiting for other players`;

    // Create game for player 1
    game = new Game(data.room);
    game.displayBoard(message);
  });
    
    // When game ends. Notify players that game has ended.
    socket.on('gameEnd', (data) => {
    game.endGame(data.message);
    socket.leave(data.room);
    });

    /**
     * End the game on any err event. 
     */
    socket.on('err', (data) => {
    game.endGame(data.message);
    });
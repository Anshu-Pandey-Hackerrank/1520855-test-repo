const socketio = require("socket.io");

function webSocketServer(serverToBind) {
  const io = socketio(serverToBind);
  io.on("connection", (socket) => {
    socket.on("public-message", (data) => {});

    socket.on("private-message", (data) => {});

    socket.on("join-room", (room) => {});
  });
}

module.exports = webSocketServer;
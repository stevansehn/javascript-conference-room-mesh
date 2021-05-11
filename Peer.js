const EventEmitter = require("events");

class Peer extends EventEmitter {
  constructor(socket) {
    super();
    this.socketId = socket.id;
    this.socket = socket;
    this.roomId;
    this.connections = new Map();
    this.addEventListeners();
  }

  addEventListeners() {
    this.socket.on("join", (roomId) => {
      this.roomId = roomId;
      this.emit("join", roomId);
    });
  }

  getPeerId() {
    return this.socketId;
  }

  getSocket() {
    return this.socket;
  }

  setConnection(peerId, report) {
    this.connections.set(peerId, report);
  }

  removeConnection(peerId) {
    this.connections.delete(peerId);
  }
}

module.exports = Peer;

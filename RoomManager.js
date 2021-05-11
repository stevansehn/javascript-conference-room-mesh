
const Peer = require("./Peer");
const Room = require("./Room");

class RoomManager {
  constructor() {
    this.peers = new Map();
    this.rooms = new Map();
  }

  createPeer(socket) {
    const peer = new Peer(socket);
    if (!this.peers.has(peer.socketId)) {
      this.peers.set(peer.socketId, peer);
    }

    peer.on("join", (roomId) => {
      console.log("join recebido por RoomManager");
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Room(roomId));
      }
      console.log("sala criada");
      const thisRoom = this.rooms.get(roomId);
      thisRoom.joinRoom(peer); // Na sala, os sockets devem emitir/ouvir entre si
    });
  }

  leaveMethod(socket) {
    const peer = this.peers.get(socket.id);
    let roomId = peer.roomId;
    const thisRoom = this.rooms.get(roomId);
    thisRoom.leaveRoom(socket.id);
  }

  manageConnections(socket, peerId, report) {
    const peer = this.peers.get(socket.id);
    let roomId = peer.roomId;
    const thisRoom = this.rooms.get(roomId);
    thisRoom.setPeerConnection(socket.id, peerId, report);
  }

  getAllRoomLengths() {
    const stat = [];
    this.rooms.forEach((room, key) => {
      stat.push(room.getRoomLength());
    });
    return stat;
  }

  getAllRoomStats() {
    const stat = [];
    this.rooms.forEach((room, key) => {
      stat.push(room.getAllPeerConnections());
    });
    return stat;
  }

  getPeersInRoom(roomId) {
    const stat = this.rooms.get(roomId).getPeerIds().peerIds;
    return { peerIds: stat };
  }

  getRoomStats(roomId) {
    const stat = this.rooms.get(roomId).getAllPeerConnections().roomConnections;
    return { roomConnections: stat };
  }

  getPeerStats(roomId, peerId) {
    const stat = this.rooms.get(roomId).getPeerConnections(peerId)
      .connections;
    return { connections: stat };
  }
}

module.exports = RoomManager;

const Peer = require("./Peer");
const EventEmitter = require("events");

class Room extends EventEmitter {
  constructor(roomId) {
    super();
    this.roomId = roomId;
    this.peers = new Map();
  }

  getRoomId() {
    return this.roomId;
  }

  getRoomLength() {
    return {
      roomId: this.roomId,
      numOfPeers: this.peers.size,
    };
  }

  setPeerConnection(socketId, peerId, report) {
    const thisPeer = this.peers.get(socketId);
    thisPeer.setConnection(peerId, report);
  }

  removePeerConnection(peerId) {
    this.peers.forEach((value, key) => {
      value.removeConnection(peerId);
    });
  }

  getPeerConnections(peerId) {
    const stat = [];
    const thisPeer = this.peers.get(peerId);
    thisPeer.connections.forEach((value, key) => {
      stat.push({ id: key, stats: value });
    });
    return { peerId: peerId, connections: stat };
  }

  getAllPeerConnections() {
    const stat = [];
    this.peers.forEach((value, peerId) => {
      stat.push(this.getPeerConnections(peerId));
    });
    return { roomId: this.roomId, roomConnections: stat };
  }

  getPeerIds() {
    const idsArray = [];
    this.peers.forEach((peer) => {
      idsArray.push(peer.socketId);
    });
    return { roomId: this.roomId, peerIds: idsArray };
  }

  joinRoom(peer) {
    if (!this.peers.has(peer.socketId)) {
      this.peers.set(peer.socketId, peer);
    }
    console.log("peer adicionado");
    console.log(this.getPeerIds());
    console.log(this.getRoomLength());

    const thisSocket = peer.getSocket();
    this.emitToRoom("peerConnected", thisSocket.id);

    thisSocket.on("peerOffer", (offer) => {
      const remotePeer = this.peers.get(offer.to).socket;
      console.log("Enviando Offer de", thisSocket.id, "para", offer.to);
      remotePeer.emit("peerOffer", { from: thisSocket.id, sdp: offer.sdp });
    });

    thisSocket.on("peerAnswer", (Answer) => {
      const remotePeer = this.peers.get(Answer.to).socket;
      console.log("Enviando Answer de", thisSocket.id, "para", Answer.to);
      remotePeer.emit("peerAnswer", { from: thisSocket.id, sdp: Answer.sdp });
    });

    thisSocket.on("peerIceCandidate", (ice) => {
      const remotePeer = this.peers.get(ice.to).socket;
      console.log("iceCandidate de", thisSocket.id, "para", ice.to);
      remotePeer.emit("peerIceCandidate", {
        from: thisSocket.id,
        candidate: ice.candidate,
      });
    });
  }

  leaveRoom(socketId) {
    this.peers.delete(socketId);
    this.removePeerConnection(socketId);
    console.log("peer removido");
    console.log(this.getPeerIds());
    console.log(this.getRoomLength());
    this.emitToRoom("peerDisconnected", socketId);
  }

  emitToRoom(evt, socketId) {
    this.peers.forEach((peer) => {
      if (socketId) {
        if (peer.socketId != socketId) {
          peer.socket.emit(evt, { id: socketId });
        }
      }
    });
  }
}

module.exports = Room;

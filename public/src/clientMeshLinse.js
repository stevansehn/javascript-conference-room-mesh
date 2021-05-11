class LinseMeshClient {
  constructor(room) {
    this.room = room;
    this.peers = new Map();
    this.dataChannels = new Map();
    this.remoteStreams = new Map();
    this.localStream;
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);
  }

  emit(eventName, args) {
    if(this.events[eventName]){
      console.log("opaaaaaaaaaaa")
      this.events[eventName].forEach((callback) => {
        callback(args);
      });
    }
  }

  muteLocal() {
    const enabled = this.localStream.getAudioTracks()[0].enabled;
    if (enabled) {
      this.localStream.getAudioTracks()[0].enabled = false;
    } else {
      this.localStream.getAudioTracks()[0].enabled = true;
    }
  }

  muteRemote(peerId) {
    this.remoteStream = this.remoteStreams.get(peerId);
    const enabled = this.remoteStream.getAudioTracks()[0].enabled;
    if (enabled) {
      this.remoteStream.getAudioTracks()[0].enabled = false;
    } else {
      this.remoteStream.getAudioTracks()[0].enabled = true;
    }
  }

  sendMessage(message) {
    console.log(message);
    const iterator = this.dataChannels.values();
    for (let i = 0; i < this.dataChannels.size; i++) {
      const dc = iterator.next().value;
      dc.send(message);
    }
  }

  pegaStats(peerId, dadoInicial, dadosIntervalo) {
    const pc = this.peers.get(peerId);
    let count1 = 1;
    let count2 = 1;
    if (pc) {
      pc.getStats().then((stats) => {
        stats.forEach((report) => {
          switch(report.type){
            case "inbound-rtp":
              if(count1){
                dadosIntervalo.packetsLost = report.packetsLost - dadoInicial.packetsLost;
                dadoInicial.packetsLost = report.packetsLost;

                dadosIntervalo.packetsReceived = report.packetsReceived - dadoInicial.packetsReceived;

                dadoInicial.packetsReceived = report.packetsReceived;
              }
              count1 = !count1
              break
            case "outbound-rtp":
              if(count2){

                dadosIntervalo.packetsSent = report.packetsSent - dadoInicial.packetsSent;

                dadoInicial.packetsSent = report.packetsSent;
              }
              count2 = !count2;
              break
            case "transport":

              dadosIntervalo.bytesSent = report.bytesSent - dadoInicial.bytesSent;
              dadosIntervalo.bytesReceived = report.bytesReceived - dadoInicial.bytesReceived;

              dadoInicial.bytesSent = report.bytesSent;
              dadoInicial.bytesReceived = report.bytesReceived;
              break
          };
        })
        console.log(dadosIntervalo)
        this.socket.emit("stats", peerId, dadosIntervalo);
        this.emit("ready", 'checagem de recebido')
      });
    }
  }

  createConnection(peerId, mediaStream) {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (evt) => {
      console.log("iceCandidate event: ", evt);
      if (evt.candidate) {
        console.log("Emitindo candidato ice para:", peerId);
        this.socket.emit("peerIceCandidate", {
          to: peerId,
          candidate: evt.candidate,
        });
      } else {
        console.log("End of candidates.");
      }
    };
    pc.ontrack = (evt) => {
      const remoteStream = this.remoteStreams.get(peerId);
      if (remoteStream) {
        remoteStream.addTrack(evt.track);
        console.log(peerId);
        const dadoInicial = {
          packetsLost: 0,
          packetsReceived: 0,
          packetsSent: 0,
          bytesSent: 0,
          bytesReceived: 0,
        };
        const dadosIntervalo = new Object();
        setInterval(() => {
          this.pegaStats(peerId, dadoInicial, dadosIntervalo);
        }, 10000);
      } else {
        const remoteStream = new MediaStream();
        this.emit("remoteStream", { stream: remoteStream, id: peerId });
        remoteStream.addTrack(evt.track);
        this.remoteStreams.set(peerId, remoteStream);
      }
    };

    pc.ondatachannel = (evt) => {
      const dc = evt.channel;
      dc.onopen = () => {
        console.log("dataChannel aberto com local peer");
      };
      dc.onmessage = (evt) => {
        this.emit("message", evt.data);
      };
      dc.onclose = () => {
        console.log("dataChannel fechado com local peer");
      };
      this.dataChannels.set(peerId, dc);
    };

    for (const track of mediaStream.getTracks()) {
      pc.addTrack(track);
    }
    this.peers.set(peerId, pc);
    return pc;
  }

  startApp(mediaStream) {
    this.socket = io.connect();

    this.socket.on("peerConnected", (remotePeer) => {
      console.log(`Usuário ${remotePeer.id} entrou na sala`);

      const pc = this.createConnection(remotePeer.id, mediaStream);

      const dc = pc.createDataChannel("teste1");

      dc.onopen = () => {
        console.log("dataChannel aberto com remote peer");
      };
      dc.onmessage = (evt) => {
        this.emit("message", evt.data);
      };

      dc.onclose = () => {
        console.log("dataChannel fechado com remote peer");
      };

      this.dataChannels.set(remotePeer, dc);

      console.log("Criando offer");
      pc.createOffer()
        .then((sdp) => {
          console.log("Offer criada");
          console.log("LocalDescription setada");
          return pc.setLocalDescription(sdp);
        })
        .then(() => {
          this.socket.emit("peerOffer", {
            to: remotePeer.id,
            sdp: pc.localDescription,
          });
        })
        .catch((e) => console.log("Erro: ", e));
    });

    this.socket.on("peerDisconnected", (peerId) => {
      console.log("Peer Disconectou");
      this.emit("peerDisconnected", peerId.id);
      this.remoteStreams.delete(peerId.id);
      const pc = this.peers.get(peerId.id);
      pc.close();
      this.peers.delete(peerId.id);
      this.dataChannels.delete(peerId.id);
    });

    this.socket.on("peerOffer", (offer) => {
      console.log("Offer recebida de", offer.from);
      console.log("SDP:", offer.sdp);
      const pc = this.createConnection(offer.from, mediaStream);
      pc.setRemoteDescription(new RTCSessionDescription(offer.sdp))
        .then(() => pc.createAnswer())
        .then((sdp) => pc.setLocalDescription(sdp))
        .then(() =>
          this.socket.emit("peerAnswer", {
            to: offer.from,
            sdp: pc.localDescription,
          })
        )
        .catch((e) => console.log("Error: ", e));
    });

    this.socket.on("peerAnswer", (Answer) => {
      console.log("resposta recebida de", Answer.from);
      const pc = this.peers.get(Answer.from);
      console.log(pc);
      if (pc) {
        console.log("Achou o peer", pc);
        pc.setRemoteDescription(
          new RTCSessionDescription(Answer.sdp)
        ).catch((e) => console.log("Error: ", e));
      }
    });

    this.socket.on("peerIceCandidate", (ice) => {
      console.log("recebendo ice");
      const pc = this.peers.get(ice.from);
      if (pc) {
        console.log("Recebido iceCandidate de:", ice.from, pc);
        pc.addIceCandidate(new RTCIceCandidate(ice.candidate)).catch((e) =>
          console.log("Error: ", e)
        );
      }
    });

    this.socket.on("connect", () => {
      if (this.room !== "") {
        console.log("Entrando na sala", this.room);
        this.socket.emit("join", this.room);
      }
    });

    this.socket.on("get this", (evt) => {
      console.log("got it", evt);
    });
  }

  start() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        this.localStream = mediaStream;
        this.emit("localStream", mediaStream);
        this.startApp(mediaStream);
        console.log("Pegando userMedia com constraints:", {
          video: true,
          audio: true,
        });
      })
      .catch((e) => console.log("Error: ", e));
  }
}

const http = require("http");
const SocketIO = require("socket.io");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const express = require("express");
const RoomManager = require("./RoomManager");
const https = require("https");
const selfsigned = require("selfsigned");

class AppService {
  async initialize(config) {
    this.config = config;
    await this.configure();
    this.configureHttpsServer();
    await this.configureSocketIOService();
  }

  configureHttpsServer() {
    const attrs = [{ name: "commonName", value: "mediarouter" }];
    const pems = selfsigned.generate(attrs, { days: 365 });
    this.server = https.createServer(
      { key: pems.private, cert: pems.cert },
      this.app
    );
  }


  async configureSocketIOService() {
    // this.server = http.createServer(this.app);
    this.io = SocketIO(this.server);
    this.io.on("connection", (socket) => {
      this.roomManager.createPeer(socket);

      socket.on("stats", (peerId, report) => {
        this.roomManager.manageConnections(socket, peerId, report);
      });

      socket.on("disconnect", (reason) => {
        this.roomManager.leaveMethod(socket);
      });
    });
  }

  async configure() {
    this.app = express();
    this.app.use("/public", express.static("./public/"));
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
    this.app.use(express.json());
    this.roomManager = new RoomManager();

    if(this.config === "test"){
      this.app.get("/", (req, res) => {
        res.sendFile(__dirname + "/public/src/test.html");
      });
    }else{
      this.app.get("/", (req, res) => {
        res.sendFile(__dirname + "/public/src/index.html");
      });
    }

    this.app.get("/rooms", (req, res) => {
      const stat = this.roomManager.getAllRoomLengths();
      res.json(stat);
    });

    this.app.get("/rooms/stats", (req, res) => {
      const stat = this.roomManager.getAllRoomStats();
      res.json(stat);
    });

    this.app.get("/rooms/:roomId", (req, res) => {
      const { roomId } = req.params;
      const stat = this.roomManager.getPeersInRoom(roomId);
      res.json(stat);
    });

    this.app.get("/rooms/:roomId/stats", (req, res) => {
      const { roomId } = req.params;
      const stat = this.roomManager.getRoomStats(roomId);
      res.json(stat);
    });

    this.app.get("/rooms/:roomId/peers/:peerId/stats", (req, res) => {
      const { roomId, peerId } = req.params;
      const stat = this.roomManager.getPeerStats(roomId, peerId);
      res.json(stat);
    });
  }

  getApp() {
    return this.app;
  }

  getServer() {
    return this.server;
  }
}

module.exports = AppService;

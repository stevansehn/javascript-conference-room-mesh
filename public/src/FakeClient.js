{
  /* <script src="../../Room.js"></script>; */
}

class FakeClient {
  constructor() {
    this.socket = io();
    this.socket.on("connect", () => {
      this.socket.emit("hello");
    });
    this.socket.on("give room", (room) => {
      console.log("give room received");
      this.socket.emit("here is your room, bro", room);
    });
  }
}

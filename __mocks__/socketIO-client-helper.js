const io = require("socket.io-client");

class SocketClient {

    async connectToSocketIO (port){
        const promise = new Promise((resolve, reject) =>{
            const socket =  io.connect(`http://localhost:${port}`)

            setTimeout(()=> {
                let callback 
                if (socket.connected){
                    callback = resolve;
                }else{
                    callback = reject;
                }
                callback(socket.connected ? socket : "falha em estabelecer conexão")
            },1000)
        })
        return promise
    }
}

module.exports = SocketClient;

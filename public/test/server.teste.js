const SocketClient = require('../__mocks__/socketIO-client-helper')
const AppService = require('../app-service')
const supertest = require('supertest')
const port = 3001;
const appService = new AppService()
let request;
const client = new SocketClient();

describe('Teste do server', () => {

    beforeAll(done => {
        
        appService.initialize(port)
        .then(() => {
            appService.getServer().listen(port, () => {
                console.log("Serviço iniciado na porta " + port);
            });
        })
        .catch((error) => {
            console.error("Erro ao iniciar o serviço", error);
        })
        const app = appService.getApp()
        request = supertest(app)
        done();
    });

    afterAll(done => {
        appService.getServer().close();
        done();
    });

    test('Testando socketio', async done => {
        const socket = await client.connectToSocketIO(port);
        expect(socket.connected).toEqual(true)
        done();
    })

    test('teste de stats', async done =>{
        const socket = await client.connectToSocketIO(port);
        expect(socket.connected).toEqual(true)
        expect(socket.id).toBeDefined()

        await socket.emit("join", "teste")
        await socket.emit("stats", socket.id, {stats: "stats1"})

        const socket2 = await client.connectToSocketIO(port);
        expect(socket2.connected).toEqual(true)
        expect(socket2.id).toBeDefined()

        await socket2.emit("join", "teste")
        await socket2.emit("stats", socket2.id, {stats: "stats2"})

        const response1 = await request.get('/rooms')
        expect(response1.body).toEqual([{"numOfPeers": 2, "roomId": "teste"}])

        const response2 = await request.get('/rooms/stats')
        expect(response2.body).toEqual([{"numOfPeers": 1, "roomId": "teste"}])

        done();
    })

    test('teste de seila', async done =>{
        const socket = await client.connectToSocketIO(port);
        expect(socket.connected).toEqual(true)
        expect(socket.id).toBeDefined()

        socket.emit("join", "teste")

        const socket2 = await client.connectToSocketIO(port);
        expect(socket2.connected).toEqual(true)
        expect(socket2.id).toBeDefined()


        socket.once("peerConnected", (remotePeer)=> {
            expect(remotePeer.id).toBe(socket2.id)
            done();
        })


        socket2.emit("join", "teste")


        
    })


})
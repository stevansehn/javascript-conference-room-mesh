const Room = require('../Room')
const Peer = require('../Peer')

jest.mock('..//Peer');


Peer.mockImplementation(socket => {
    const rv = new Object;
    rv.socket = socket;
    rv.socketId = socket.id;
    rv.connections = new Map();
    rv.setConnection = jest.fn((peerId, report) => {
        rv.connections.set(peerId, report);
    });
    rv.removeConnection = jest.fn();
    return rv;
})


describe('Teste da room', () => {
    const sala = new Room("roomId")

    beforeAll(()=>{
        sala.joinRoom({id: "peer1"})
        sala.joinRoom({id: "peer2"})
        sala.joinRoom({id: "peer3"})

        sala.setPeerConnection("peer1", "peer2", {teste: "stat12"})
        sala.setPeerConnection("peer1", "peer3", {teste: "stat13"})
        sala.setPeerConnection("peer2", "peer3", {teste: "stat23"})
        sala.setPeerConnection("peer3", "peer1", {teste: "stat31"})
    })
    
    // sala.setPeerConnection("peer1", "peer3", {teste: "teste2"})
    

    test('testando getRoomId', () => {
        const roomId = sala.getRoomId();

        expect(Peer).toHaveBeenCalledTimes(3);
        expect(Peer).toHaveBeenCalledWith({id:"peer1"});
        expect(roomId).toBe("roomId");
    });

    test('testando getRoomLength', () => {
        const roomLength = sala.getRoomLength();

        expect(roomLength.roomId).toBe("roomId");
        expect(roomLength.numOfPeers).toBe(3)
    });

    test('testando getPeerConnections', () => {
        const peerConnection = sala.getPeerConnections("peer1")

        expect(peerConnection.localId).toBe("peer1");
        expect(peerConnection.peerConnections).toEqual([{ remoteId: "peer2", connectionStats: {teste: "stat12"} }, { remoteId: "peer3", connectionStats: {teste: "stat13"} }]);
    });

    test('testando getAllPeerConnections', () => {
        const allPeerConnection = sala.getAllPeerConnections()

        expect(allPeerConnection.roomId).toBe("roomId");
        expect(allPeerConnection.roomConnections).toEqual(
            [{localId:"peer1",
              peerConnections:[
                  {remoteId: "peer2",
                   connectionStats: {teste: "stat12"}
                  },
                  {remoteId: "peer3",
                   connectionStats: {teste: "stat13"} 
                  }
              ]
             },
             {localId:"peer2",
              peerConnections:[
                 {remoteId: "peer3",
                     connectionStats: {teste: "stat23"}
                 }
              ]
             },
             {localId:"peer3",
              peerConnections:[
                 { remoteId: "peer1",
                     connectionStats: {teste: "stat31"}
                 }
              ]
             }
            ]);
    });

    test('testando getPeerIds', () => {
        const peerIds = sala.getPeerIds();

        expect(peerIds.roomId).toBe("roomId");
        expect(peerIds.peerIds).toEqual(["peer1","peer2","peer3"])
    });

    test('testando peer saindo', () => {

        sala.leaveRoom("peer1")
        const roomLength = sala.getRoomLength();
        const peerIds = sala.getPeerIds();


        expect(roomLength.roomId).toBe("roomId");
        expect(roomLength.numOfPeers).toBe(2)
        expect(peerIds.peerIds).toEqual(["peer2","peer3"])
    });
  });
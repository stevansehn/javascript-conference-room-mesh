const Peer = require('../Peer')

describe('Teste do peer', () => {

    const peer1 = new Peer({id:"peer1"})

    test('testando getRoomId', () => {
        const peerId = peer1.getPeerId();

        expect(peerId).toBe("peer1");
    });
})

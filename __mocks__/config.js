module.exports = {
  port: 9000,
  mediasoup: {
    workerSettings: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999
    },
    routerOptions: {
      mediaCodecs: [{
          kind      : 'audio',
          mimeType  : 'audio/opus',
          clockRate : 48000,
          channels  : 2
        }, {
          kind       : 'video',
          mimeType   : 'video/VP8',
          clockRate  : 90000,
          parameters : {
            'x-google-start-bitrate' : 1000
          }
        }, {
          kind       : 'video',
          mimeType   : 'video/VP9',
          clockRate  : 90000,
          parameters : {
            'profile-id'             : 2,
            'x-google-start-bitrate' : 1000
          }
        }, {
          kind       : 'video',
          mimeType   : 'video/h264',
          clockRate  : 90000,
          parameters : {
            'packetization-mode'      : 1,
            'profile-level-id'        : '42e01f',
            'level-asymmetry-allowed' : 1,
            'x-google-start-bitrate'  : 1000
          }
        }
      ]
    },
    transportOptions: {
      listenIps: [
        { ip: '10.0.0.105', announcedIp: null }
      ],
      initialAvailableOutgoingBitrate : 1000000,
      minimumAvailableOutgoingBitrate : 600000,
      maxSctpMessageSize              : 262144,
      maxIncomingBitrate              : 1500000
    },
    iceServers: [
      { urls: 'turn:turn.una.com.br:5349', username: 'una', credential: 'una', credentialType: 'password' }
    ]
  }
}
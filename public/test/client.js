// HTML5 <video> elements
const localVideo = document.querySelector("#localVideo");
const remoteVideoContainer = document.querySelector("#remoteVideoContainer");
const muteButton = document.getElementById('muteButton');
const sendButton = document.getElementById('sendButton');
let textArea = document.getElementById('dataChannelSend');

const room = 'teste';
// const room = prompt("Enter room name:");

const cml = new LinseMeshClient(room);

const peerConfig = null;

function handleMessage(message){
  console.log(message);
}

function handleUserMedia(stream) {
  const localStream = stream;
  console.log(localStream);
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  localVideo.onloadedmetadata= () => localVideo.play();
  console.log("Adicionando stream local.");
}

function handleRemoteStream(evt){
  const videoElement = document.createElement('video');
  videoElement.id = evt.id;
  videoElement.srcObject = evt.stream;
  videoElement.onloadedmetadata = () => videoElement.play();
  this.remoteVideoContainer.appendChild(videoElement);
}

function removeRemoteVideo(peerId){
  remoteVideo = document.getElementById(peerId);
  this.remoteVideoContainer.removeChild(remoteVideo);
}

cml.start();

cml.on('message', evt =>{
  handleMessage(evt);
});

cml.on('localStream', evt=>{
  handleUserMedia(evt);
});

cml.on('remoteStream', evt=>{
  handleRemoteStream(evt);
});

cml.on('peerDisconnected', evt =>{
  removeRemoteVideo(evt);
});

muteButton.onclick = () => cml.muteLocal();
sendButton.onclick = () => cml.sendMessage(textArea.value);



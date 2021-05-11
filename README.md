# Sala de Conferência Mesh

<p align="justify"> Com WebRTC </p>

<p align="center">
<img src="https://img.shields.io/badge/contributors-2-brightgreen"/>
<img src="https://img.shields.io/badge/backers-1-brightgreen"/>
<img src="https://img.shields.io/badge/sponsors-1-brightgreen"/>
<img src="https://img.shields.io/badge/version-1.0.0-blue"/>
<img src="https://img.shields.io/amo/stars/dustman"/>
<img src="https://img.shields.io/github/followers/gabriel-barbosa-seibt?style=social"/>
</p>

## O que faz e para que serve :computer::speech_balloon:<br/>

:punch: Sala de Conferência\
:punch: Topologia Mesh\
:punch: Áudio, vídeo e dados\
:punch: Vários participantes\
:punch: Peer2peer\
:punch: WebRTC

> Status do Projeto: Em desenvolvimento :warning:

<img src="https://github.com/gabriel-barbosa-seibt/teste_sala_mesh/blob/master/src/img/webrtc-app-development-india-503x198.png"/></img>

## Pré-requisitos

:warning: [Node](https://nodejs.org/en/download/)
:warning: [socket.io](https://socket.io/)

## Dependências

No terminal, clone o projeto:

```
git clone https://github.com/gabriel-barbosa-seibt/teste_sala_mesh
```

Instale o módulo node-static

```
npm i node-static
```

## **Inicialização**

```javascript
const cml = new LinseMeshClient(room);
```

| Parâmetros | Descrição                                         |
| ---------- | ------------------------------------------------- |
| _**room**_ | String com o nome da sala no qual vai se conectar |

## **Métodos**

### start()

Realiza toda a sinalização entre os peers.

#### **Exemplo**

```javascript
cml.start();
```

&nbsp;

### sendMessage(message)

Envia uma string determinada pelo parâmetro _message_ para todos os outros peers na sala.

&nbsp;

| Parâmetros    | Descrição                                            |
| ------------- | ---------------------------------------------------- |
| _**message**_ | String com a messagem a ser enviada aos outros peers |

&nbsp;

#### **Exemplo**

Neste exemplo, ao se clicar no botão _sendButton_ é enviada a mensagem de textArea para os outros peers, atraves do método _sendMessage()_.

```javascript
const sendButton = document.getElementById("sendButton");
let textArea = document.getElementById("dataChannelSend");

sendButton.onclick = () => cml.sendMessage(textArea.value);
```

&nbsp;

### muteLocal()

Muta o audio do peer local.

&nbsp;

#### **Exemplo**

Neste exemplo, ao se clicar no botão _muteButton_ o áudio do local peer é mutado.

```javascript
const muteButton = document.getElementById("muteButton");

muteButton.onclick = () => cml.muteLocal();
```

&nbsp;

### muteRemote(peerId)

Muta o audio do peer especificado pelo _peerId_.

&nbsp;

```javascript
const muteRemoteButton = document.getElementById("muteRemoteButton");

muteRemoteButton.onclick = () => cml.muteRemote(peerId);
```

&nbsp;

### emit(eventName, args)

Emite um evento determinado pelo _eventName_, com os argumentos passados em _args_.

&nbsp;

| Parâmetros      | Descrição                                        |
| --------------- | ------------------------------------------------ |
| _**eventName**_ | String com o nome do evento que vai ser emitido  |
| _**args**_      | Argumentos que serão emitidos junto com o evento |

&nbsp;

#### **Exemplo**

Neste exemplo, é emitido um evento _localStream_ com o argumento mediaStream.

```javascript
  cml.emit('localStream', mediaStream);
```
### on(eventName, callback)

Escuta um evento determinado por _eventName_ e realiza a função passada em _callback_ com os argumetos passados pelo método **emit()**.

&nbsp;
| Parâmetros      | Descrição                                 |
| --------------- |-------------------------------------------|
| _**eventName**_ |String com o nome do evento a ser escutado.|
| _**callback**_  |Função que vai ser realizada quando o evento é emitido. Essa função tem como argumento o _args_ passado pelo método **emit()**|

#### **Exemplo**

Este exemplo é complemetar ao exemplo de cima. Nele se escuta pelo evento _localStream_ e se realiza a função handleUserMedia com o argumento evt, que de acordo com o exemplo do método _emit()_ é _mediaStream_.

```javascript
cml.on("localStream", (evt) => {
  handleUserMedia(evt);
});
```

## **Eventos**

### 'message'

Este evento é disparado quando um outro peer utiliza o método _sendMessage_. Recebe como argumento uma string com a mensagem enviada pelo outro peer.

&nbsp;

#### **Exemplo**

No exemplo, quando o evento é recebido, é dado console.log na mensagem recebida.

```javascript
function handleMessage(message) {
  console.log(message);
}

cml.on("message", (evt) => {
  handleMessage(evt);
});
```

### 'localStream'

Este evento é disparado ao se obter a stream local. Recebe como argumento uma _MediaStream_ com a stream de áudio e vídeo do local peer.

&nbsp;

#### **Exemplo**

No exemplo, a local stream é recebida no evento e depois adicionada ao elemento DOM localVideo.

```javascript
const localVideo = document.querySelector("#localVideo");

function handleUserMedia(stream) {
  const localStream = stream;
  console.log(localStream);
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  localVideo.onloadedmetadata = () => localVideo.play();
  console.log("Adicionando stream local.");
}

cml.on("localStream", (evt) => {
  handleUserMedia(evt);
});
```

### 'remoteStream'

Este evento é disparado ao se receber a stream de outro peer. Recebe como argumento um objeto que contêm a _MediaStream_ do remote peer e o seu id.

&nbsp;

#### **Exemplo**

No exemplo, a remote stream e o peerId são recebidos no evento. Depois é criado um elemento DOM de video, com id especificado por peerId, que depois é adicionado ao _remoteVideoContainer_ que contêm todos os remote videos.

```javascript
const remoteVideoContainer = document.querySelector("#remoteVideoContainer");

function handleRemoteStream(evt) {
  const videoElement = document.createElement("video");
  videoElement.id = evt.id;
  videoElement.srcObject = evt.stream;
  videoElement.onloadedmetadata = () => videoElement.play();
  this.remoteVideoContainer.appendChild(videoElement);
}

cml.on("remoteStream", (evt) => {
  handleRemoteStream(evt);
});
```

### 'peerDisconnected'

Este evento é disparado quando um outro peer disconecta da sala. Recebe como argumento uma string com id do peer que disconectou.

&nbsp;

#### **Exemplo**

No exemplo, o peerId do peer que disconectou é recebido e usado para remover do container o elemento de video que tem como id o _peerId_.

```javascript
const remoteVideoContainer = document.querySelector("#remoteVideoContainer");

function removeRemoteVideo(peerId) {
  remoteVideo = document.getElementById(peerId);
  this.remoteVideoContainer.removeChild(remoteVideo);
}

cml.on("peerDisconnected", (evt) => {
  removeRemoteVideo(evt);
});
```

## **Exemplo de Utilização**

Crie um arquivo .html e copie e cole o seguinte trecho de código:

```javascript
<!DOCTYPE html>
<html>
<head>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">

<title>Teste Sala Mesh</title>

</head>

<body>

<div id='mainDiv'>

	<table border="1" width="100%">
		<tr>
			<th>
				Local video
			</th>
			<th>
				'Remote' video
			</th>		
		</tr>
		<tr>
			<td>
				<video id="localVideo" ></video>
				<button id="muteButton">Mutar</button>
				<div class="messageContainer">
					<ul class="messages">
					   
					</ul>
				</div>
				<div class="main__message_container">
					<textarea  id="dataChannelSend" placeholder="Escreva a mensagem aqui"></textarea>
					<button id="sendButton">Mandar Mensagem</button>
				</div>
			</td>
			<td>
				<div id ="remoteVideoContainer">						
			</td>	
		</tr>		
	</table>
</div>

<script src='/socket.io/socket.io.js'></script>
<script src='js/lib/adapter.js'></script>
<script src='clientMeshLinse.js'></script>

</body>
</html>
```

Crie um elemento `<script></script>` e copie e cole o seguinte trecho dentro dele:

```javascript
const localVideo = document.querySelector("#localVideo");
const remoteVideoContainer = document.querySelector("#remoteVideoContainer");
const muteButton = document.getElementById('muteButton');
const sendButton = document.getElementById('sendButton');
let textArea = document.getElementById('dataChannelSend');

const room = prompt("Enter room name:");

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
```

O resultado final deve ser o seguinte:

```html
<!DOCTYPE html>
<html>
<head>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">

<title>Teste Sala Mesh</title>

</head>

<body>

<div id='mainDiv'>

	<table border="1" width="100%">
		<tr>
			<th>
				Local video
			</th>
			<th>
				'Remote' video
			</th>
		</tr>
		<tr>
			<td>
				<video id="localVideo" ></video>
				<button id="muteButton">Mutar</button>
				<div class="messageContainer">
					<ul class="messages">

					</ul>
				</div>
				<div class="main__message_container">
					<textarea  id="dataChannelSend" placeholder="Escreva a mensagem aqui"></textarea>
					<button id="sendButton">Mandar Mensagem</button>
				</div>
			</td>
			<td>
				<div id ="remoteVideoContainer">
			</td>
		</tr>
	</table>
</div>

<script src='/socket.io/socket.io.js'></script>
<script src='js/lib/adapter.js'></script>
<script src='clientMeshLinse.js'></script>
<script>
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

</script>

</body>
</html>

```
Rode o servidor

```
node server.js
```

Copie e cole o seguinte na barra de endereço do seu navegador

```
http://localhost:3000/
```

## **Como testar com o Swagger**

Instale o swagger express

```
npm i swagger-ui-express
```

Com o servidor funcionando, copie e cole isto na barra de endereço do seu navegador:

```
http://localhost:3000/api-docs
```

Siga a documentação interativa que aparecerá na página do navegador.
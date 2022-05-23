'use strict';

const micIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M10.021 11.375Q9.125 11.375 8.49 10.74Q7.854 10.104 7.854 9.208V4.229Q7.854 3.333 8.49 2.708Q9.125 2.083 10.021 2.083Q10.917 2.083 11.542 2.708Q12.167 3.333 12.167 4.229V9.208Q12.167 10.104 11.542 10.74Q10.917 11.375 10.021 11.375ZM9.354 17.292V14.625Q7.292 14.396 5.938 12.844Q4.583 11.292 4.583 9.208H5.917Q5.917 10.917 7.115 12.115Q8.312 13.312 10.021 13.312Q11.708 13.312 12.906 12.115Q14.104 10.917 14.104 9.208H15.438Q15.438 11.312 14.094 12.854Q12.75 14.396 10.688 14.625V17.292Z"/></svg>';

const micOffIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M14.479 11.896 13.458 10.896Q13.667 10.542 13.771 10.104Q13.875 9.667 13.875 9.208H15.208Q15.208 9.958 15.031 10.646Q14.854 11.333 14.479 11.896ZM11.833 9.271 7.625 5.042V4.25Q7.625 3.354 8.26 2.719Q8.896 2.083 9.792 2.083Q10.688 2.083 11.312 2.719Q11.938 3.354 11.938 4.25V8.646Q11.938 8.812 11.917 8.99Q11.896 9.167 11.833 9.271ZM16.417 18.208 12.229 13.979Q11.854 14.271 11.354 14.427Q10.854 14.583 10.458 14.625V17.292H9.125V14.625Q7.208 14.417 5.781 12.917Q4.354 11.417 4.354 9.208H5.688Q5.688 10.917 6.885 12.115Q8.083 13.312 9.792 13.312Q10.167 13.312 10.531 13.188Q10.896 13.062 11.104 12.896L1.479 3.271L2.417 2.333L17.354 17.25Z"/></svg>';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var isMuted = false;

var iceConfig = {
  iceServers: [
      // { url: 'stun:stun.l.google.com:19302' },
      // { url: 'stun:stun1.l.google.com:19302' },
      // { url: 'stun:stun2.l.google.com:19302' },
      // { url: 'stun:stun3.l.google.com:19302' },
      // { url: 'stun:stun4.l.google.com:19302' },
      // { url: 'stun:stun.ekiga.net' },
      // { url: 'stun:stun.ideasip.com' },
      // { url: 'stun:stun.schlund.de' },
      // { url: 'stun:stun.stunprotocol.org:3478' },
      // { url: 'stun:stun.voiparound.com' },
      // { url: 'stun:stun.voipbuster.com' },
      // { url: 'stun:stun.voipstunt.com' },
      // { url: 'turn:turn01.hubl.in?transport=udp' },
      // { url: 'turn:turn02.hubl.in?transport=tcp' },
      // {
      //   url: 'turn:numb.viagenie.ca',
      //   credential: 'muazkh',
      //   username: 'webrtc@live.com'
      // },
      // {
      //   url: 'turn:192.158.29.39:3478?transport=udp',
      //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      //   username: '28224511:1379330808'
      // },
      // {
      //   url: 'turn:turn.bistri.com:80',
      //   credential: 'homeo',
      //   username: 'homeo'
      // },
      {
        url: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'webrtc'
      },
      // {
      //   url: 'turn:relay.backups.cz',
      //   credential: 'webrtc',
      //   username: 'webrtc'
      // },
      // {
      //   url: 'turn:relay.backups.cz?transport=tcp',
      //   credential: 'webrtc',
      //   username: 'webrtc'
      // },
      
  ],
};

// turn:turn01.hubl.in?transport=udp
// turn:turn02.hubl.in?transport=tcp

// {
//     url: 'turn:numb.viagenie.ca',
//     credential: 'muazkh',
//     username: 'webrtc@live.com'
// },
// {
//     url: 'turn:192.158.29.39:3478?transport=udp',
//     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
//     username: '28224511:1379330808'
// },
// {
//     url: 'turn:192.158.29.39:3478?transport=tcp',
//     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
//     username: '28224511:1379330808'
// },
// {
//     url: 'turn:turn.bistri.com:80',
//     credential: 'homeo',
//     username: 'homeo'
//  },
//  {
//     url: 'turn:turn.anyfirewall.com:443?transport=tcp',
//     credential: 'webrtc',
//     username: 'webrtc'
// }

/////////////////////////////////////////////

const kvp = document.location.search.substr(1).split('&');

const params = kvp.reduce((acc, param) => {
  const  [key, value] = param.split('=');

  acc[key] = value;

  return acc;
}, {});

var room = params.room;

if (!room) {
  room = randomToken();
  // Could prompt for room name:
  // room = prompt('Enter room name:');

  const roomUrl = `${document.location.href}?room=${room}`;

  console.log(roomUrl);

  window.history.pushState({}, "" , roomUrl);
}

function randomToken() {
  return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

var socket = io.connect();

if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
}

socket.on('created', function(room) {
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function(room) {
  console.log('joined: ' + room);
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// This client receives a message
socket.on('message', function(message) {
  console.log('Client received message:', message);
  console.log('message', message);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'hangup') {
    stop();
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector('#local-video');
var remoteVideo = document.querySelector('#remote-video');

var constraints = {
  video: false,
  audio: false,
};

async function init() {
  await navigator.mediaDevices.enumerateDevices()
    .then((res) => {
      res.forEach(({ kind }) => {
        if (kind === 'videoinput') {
          constraints.video = true;
        }

        if (kind === 'audioinput') {
          constraints.audio = true;
        }
      });
    });

  await navigator.mediaDevices.getUserMedia(constraints)
    .then(gotStream)
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });
};

init();

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }
}

console.log('Getting user media with constraints', constraints);

function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function() {
  sendMessage('bye');
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(iceConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  isInitiator = true;
  isStarted = false;

  location.reload();
}

function stop() {
  isStarted = false;
  pc?.close();
  pc = null;

  window.close();
}

function toggleMute() {
  isMuted = !isMuted;

  const track = localStream.getAudioTracks()[0];

  track.enabled = !isMuted;

  muteButton.classList.toggle('button--active');

  muteButton.innerHTML = isMuted ? micOffIcon : micIcon;
};

const endCallButton = document.getElementById('end-call-button');

endCallButton.addEventListener('click', stop);

const muteButton = document.getElementById('mute-button');

muteButton.addEventListener('click', toggleMute);

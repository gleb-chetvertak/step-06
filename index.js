'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('https');
var socketIO = require('socket.io');
const port = process.env.PORT || 3000;
const fs = require('fs');

const options = {
  key: fs.readFileSync('/var/www/webrtc/privkey.pem'),
  cert: fs.readFileSync('/var/www/webrtc/fullchain.pem'),
};

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(options, function(req, res) {
  fileServer.serve(req, res);
}).listen(port,  () => {
  console.log("Listening on port " + port + "...")
});

var io = socketIO.listen(app,  () => {
  console.log("Listening socketIO ...")
});
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    // console.log("Listening ...\n\t" + arguments[0]);
    // console.log('\t'+ arguments[1]);

    var array = ['Message from server:\n'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    // log(`Rooms - ${Object.keys(io.sockets.adapter.rooms).join(', ')}`);
    // if (message === 'bye') {
    //   log('BYE!!!!!!!!!')
    // } else {
      log('Client said: ', message);
      // for a real app, would be room-only (not broadcast)
      socket.broadcast.emit('message', message);
    // }
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    log(io.sockets.adapter.rooms);
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      
      // io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);

      io.sockets.in(room).emit('ready');
      socket.broadcast.emit('ready', room);
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '192.168.0.128') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('disconnect', function(reason) {
    console.log(`Peer or server disconnected. Reason: ${reason}.`);
    socket.broadcast.emit('bye');
  });

  socket.on('bye', function(room) {
    console.log(`Peer said bye on room ${room}.`);
  });

  // socket.on('bye', function(){
  //   console.log('received bye');
  //   log('bye  !!!!!');
  //   // socketIO.close();
  //   // window.location.reload();
  // });

});

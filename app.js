const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {Users} = require('./utils/users');

const public = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();


app.use(express.static(public));

io.on('connection', (socket) => {

  
  socket.on('join', (params, callback) => {
    if (!params.name || !params.room) {
      return callback('Scrie numele daun');
    }
 
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    io.of("/rooms").emit("roomlist", users.getRooms());
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Chatbot', 'Welcome to chat'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Chatbot', `${params.name} has joined.`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && message.text) io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    io.of("/rooms").emit("roomlist", users.getRooms());

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Chatbot', `${user.name} has left.`));
    }
  });
});

io.of("/rooms").on("connection", (socket) => {
  socket.emit("roomlist", users.getRooms());
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

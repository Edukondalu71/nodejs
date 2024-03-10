// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('websocket').server;
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket({ httpServer: server });

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/testdata');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// WebSocket connections
const connections = [];

wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);
  connections.push(connection);

  console.log('Client connected');

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      console.log('Received:', data);

      // Example: Save message to MongoDB
      const MessageModel = mongoose.model('Message', { content: String });
      const newMessage = new MessageModel({ content: data.content });
      newMessage.save();

      // Broadcast the message to all connected clients
      connections.forEach((client) => {
        client.sendUTF(JSON.stringify(data));
      });
    }
  });

  connection.on('close', () => {
    console.log('Client disconnected');
    const index = connections.indexOf(connection);
    if (index !== -1) {
      connections.splice(index, 1);
    }
  });
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});

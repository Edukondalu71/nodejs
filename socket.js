const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
const User = require('./models/user');
const Message = require('./models/message');
const port = 3000;


const http = require("http").Server(app);
const socketIO = require("socket.io")(http);
const uri = "mongodb+srv://yedu7668:yedu007@cluster0.qq01a8o.mongodb.net/";
const client = new MongoClient(uri);

mongoose
    .connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log("error", error?.message);
    });

const userSocketMap = {};
socketIO.on('connection', socket => {
    console.log('a user is connected', socket.id);
    const userId = socket.handshake.query.userId;

    console.log('userid', userId);

    if (userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
    }

    console.log('user socket data', userSocketMap);

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        delete userSocketMap[userId];
    });

    socket.on('sendMessage', ({ senderId, receiverId, message }) => {
        const receiverSocketId = userSocketMap[receiverId];

        console.log('receiver Id', receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', {
                senderId,
                message,
            });
        }
    });
});
http.listen(4000, () => console.log(`Socket is running`));
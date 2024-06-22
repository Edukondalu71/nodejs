const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
const User = require('./models/user');
const Message = require('./models/message');
const port = 3000;


const http = require("http").Server(app);
const socketIO = require("socket.io")(http);


//html-renderiong
app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, './public/dashboard.html'));
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, './public/index.html'));
// });
////////////////

const uri = "mongodb+srv://yedu7668:yedu007@cluster0.qq01a8o.mongodb.net/";

mongoose
  .connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.log("error", error?.message);
  });

//Socket
const userSocketMap = {};
socketIO.on('connection', socket => {
  //console.log('a user is connected', socket.id);
  const userId = socket.handshake.query.userId;

  //console.log('userid', userId);

  if (userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
  }

  //console.log('user socket data', userSocketMap);

  socket.on('disconnect', () => {
    //console.log('user disconnected', socket.id);
    //delete userSocketMap[userId];
  });

  socket.on('sendMessage', ({ senderId, receiverId, message }) => {
    const receiverSocketId = userSocketMap[receiverId];

    //console.log('receiver Id', receiverId);

    if (receiverSocketId) {
      socketIO.to(receiverSocketId).emit('receiveMessage', {
        senderId,
        message,
      });
    }
  });
});

app.post('/sendMessage', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      //console.log('emitting recieveMessage event to the reciver', receiverId);
      socketIO.to(receiverSocketId).emit('newMessage', newMessage);
    } else {
      console.log('Receiver socket ID not found');
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('ERROR', error?.message);
  }
});

app.get('/messages', async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).populate('senderId', '_id name');

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error', error?.message);
  }
});


//Login_Api's
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const secretKey = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({ userId: user._id }, secretKey);
    res.status(200).json({ token });
  } catch (error) {
    console.log('error loggin in', error?.message);
    res.status(500).json({ message: error?.message });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password, mobilenumber } = req.body;

  const newUser = new User({ username, email, password, mobilenumber });

  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: 'User registered succesfully!' });
    })
    .catch(error => {
      console.log('Error creating a user', error?.message);
      res.status(500).json({ message: error?.message });
    });
});

app.get('/checkusernameisvalid', async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (user) res.status(401).json({ data: "username already exisits !" });
    return res.status(200).json({ data: "OK" });
  }
  catch (error) {
    return res.status(500).json({ data: error?.message });
  }

});

app.get('/getUserData', async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (!user) res.status(401).json({ data: "username details not found !" });
    return res.status(200).json({ data: user });
  }
  catch (error) {
    return res.status(500).json({ data: error?.message });
  }
});

app.get('/getusers/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    let users = await User.db.collection('users').find().toArray();
    const user = await User.findOne({ _id: userId });

    if (user) {
      filterList = users.filter((el) => !user?.friends.includes(el["_id"]));
      return res.status(200).json({ data: filterList });
    } else return res.status(200).json({ data: users });
  }
  catch (error) {
    return res.status(500).json({ data: error?.message });
  }
});

app.post('/sendrequest', async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({ message: 'Receiver not found' });
  }

  receiver.requests.push({ from: senderId, message });
  await receiver.save();

  res.status(200).json({ message: 'Request sent succesfully' });
});

app.get('/getrequests/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate(
      'requests.from',
      'username email',
    );

    if (user) {
      res.json(user.requests);
    } else {
      res.status(400);
      throw new Error('User not found');
    }
  } catch (error) {
    console.log('error', error?.message);
  }
});

app.post('/acceptrequest', async (req, res) => {
  try {
    const { userId, requestId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { requests: { from: requestId } },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { friends: requestId },
    });

    const friendUser = await User.findByIdAndUpdate(requestId, {
      $push: { friends: userId },
    });

    if (!friendUser) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    res.status(200).json({ message: 'Request accepted sucesfully' });
  } catch (error) {
    console.log('Error', error?.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await User.findById(userId).populate('friends', 'username');
    res.json(users.friends);
  } catch (error) {
    console.log('Error fetching user', error?.message);
    return null;
  }
});

app.listen(port, () => console.log(`Server is running`));
http.listen(4000, () => console.log(`Socket is running`));
////////////

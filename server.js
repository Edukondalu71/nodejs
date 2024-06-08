const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, './public/dashboard.html'));
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

const uri = "mongodb+srv://yedu7668:yedu007@cluster0.qq01a8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

app.post('', async (req, res) => {
  res.status(500).json({ message: "error?.message" });
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');

    // Find user by username
    let name = username
    const user = await collection.findOne({ name });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid username and password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //Verify password
    const passwordMatch = await bcrypt.compare(hashedPassword, user.password);
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid username and password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, 'yedu@007', { expiresIn: '1h' });

    // Respond with token
    res.status(200).json({ message: 'Login successful', token: token });
  } catch (error) {
    res.status(500).json({ message: error?.message });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

app.post('/adduser', async (req, res) => {
  const { username, password, age, email } = req.body;
  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');
    const user = await collection.findOne({ name: username });
    if (user) return res.status(401).json({ message: 'username already exists !' });
    await collection.insertOne({
      name: username,
      password: password,
      age: age,
      email: email
    });
    res.status(200).json({ message: `User registered successfully` });
  } catch (error) {
    res.status(500).json({ message: error?.message });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

app.post('/updateuser', async (req, res) => {
  const { name , password } = req.body;
  try {
    // Validate input
    if (!name || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');
    const user = await collection.findOne({ name });
    if(!user) return res.status(201).json({ message: 'username details not found !' }); 
    if(password !== user.password) return res.status(206).json({ message: 'Invalid username and password' });
    await collection.updateOne({ name },{
      $set: { ...user, ...req.body } // Update operation, setting the "status" field to "active"
    });
    res.status(200).json({ message: `User details updated successfully` });
  } catch (error) {
    res.status(500).json({ message: error?.message });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

app.post('/deleteuser', async (req, res) => {
  const { name } = req.body;
  try {
    // Validate input
    if (!name)  return res.status(300).json({ message: "Not Found" });
    // Connect to MongoDB
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');
    await collection.deleteOne({ name });
    res.status(200).json({ message: `Account deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error?.message });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

app.post('/getpassword', async (req, res) => {
  const { username, email } = req.body;
  try {
    // Validate input
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');

    // Find user by username
    const user = await collection.findOne({ name: username });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid username and mail' });
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    //Verify password
    //const passwordMatch = await bcrypt.compare(hashedPassword, user.password);
    if (user.email !== email) {
      return res.status(401).json({ message: 'Invalid username and password' });
    }
    // Respond with token
    res.status(200).json({ password: user.password });
  } catch (error) {
    res.status(500).json({ message: error?.message });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

app.get('/checkusernameisvalid', async (req, res) => {
  const { username } = req.query;
  try {
    if (!username) return res.status(200).json({ data: null });
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');
    const user = await collection.findOne({ name: username });
    if(user) return res.status(200).json({ data : 'username exists ! try another name.' });
    res.status(200).json({ data :  'Ok'});
  } catch (error) {
    res.status(500).json({ error: error?.message });
  } finally {
    await client.close();
  }
});

app.get('/getUserData', async (req, res) => {
  const { name } = req.query;
  try {
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');
    const user = await collection.findOne({ name });
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: error?.message });
  } finally {
    // Close the connection after performing database operations
    await client.close();
  }
});

app.get('/getData', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');
    // Perform database operations here
    // Example: Retrieve documents from the collection
    const documents = await collection.find({ name: 'Srinu' }).toArray();
    //let userLoginList = documents.map((el) => el);
    res.status(200).json({ "data": documents });
  } catch (error) {
    res.status(500).json({ error: error?.message });
  } finally {
    // Close the connection after performing database operations
    await client.close();
  }
});

app.listen(port, () => console.log(`Server is running`));

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//post api
//const userRoutes = require('./components/routes/userRoute')

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
const port = 3000;

const uri = "mongodb+srv://yedu7668:yedu007@cluster0.qq01a8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Middleware function
const myMiddleware = (req, res, next) => {
  const { username, password } = req.body;
  if(Object.keys(req.query).length !== 2){
    res.status(401).json({ responsemessage: "Please Check your payload" });
  }
  else if(username.length > 0 && password.length > 0) {
    next(); // Call the next middleware in the stack
  }
  else {
    res.status(400).json({ responsemessage: 'Please enter valid username and password' });
  }
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
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
      return res.status(401).json({ message: 'Invalid username' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //Verify password
    const passwordMatch = await bcrypt.compare(hashedPassword, user.password);
    console.log(user.password , password);
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, 'your_secret_key', { expiresIn: '1h' });

    // Respond with token
    res.status(200).json({ message: 'Login successful', token: token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

app.post('/adduser', async (req, res) => {
  const { username, password, age, email } = req.body;
  console.log(req.body);
  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db('testdata');
    const collection = database.collection('Edukondalu');
    const result = await collection.insertOne({
      name: username,
      password: password,
      age: age,
      email:email
    });
    console.log(result.insertedId);
    res.status(200).json({ message: `User registered successfully: ${result.insertedId}` });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Close MongoDB connection
    await client.close();
  }
});

app.get('/getData', async (req, res) => {
  const { username, password } = req.query;
    try {
      await client.connect();
      const database = client.db('testdata');
      const collection = database.collection('Edukondalu');
      // Perform database operations here
      // Example: Retrieve documents from the collection
      const documents = await collection.find({name: 'Srinu'}).toArray();
      //let userLoginList = documents.map((el) => el);
      res.status(200).json({"data" : documents });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      // Close the connection after performing database operations
      await client.close();
    }
});

//app.use('/user', userRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

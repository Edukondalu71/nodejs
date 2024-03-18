const express = require('express');
const { Pool } = require('pg');

// Create a pool for connecting to the PostgreSQL database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdata',
  password: "2526",
  port: 5432, // Default PostgreSQL port
});

const app = express();
const port = 3000;
app.use(express.json());

// Define a route to fetch data
app.get('/data', (req, res) => {
  // Replace 'your_table_name' with the actual table name
  const query = 'SELECT * FROM developers';

  pool.query(query, (error, result) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(result.fields);
    }
  });
});

// Define a route to handle the insert operation
app.post('/insert', (req, res) => {
  const { column1, column2, column3 } = req.body;

  const query = `
    INSERT INTO developers (column1, column2, column3)
    VALUES ($1, $2, $3)
    RETURNING *;`;

  pool.query(query, [column1, column2, column3], (error, result) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows[0]);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



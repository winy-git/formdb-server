const express = require('express');
const mariadb = require('mariadb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up views and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Create a MariaDB connection pool
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'my_password',
    database: 'my_database',
    connectionLimit: 10
});

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle form submission
app.post('/join', async (req, res) => {
    const { name, password, phone, email } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();
        const query = 'INSERT INTO members (name, password, phone, email) VALUES (?, ?, ?, ?)';
        await connection.query(query, [name, password, phone, email]);

        res.send(`
            <h3>Joined Successfully</h3>
            <p>Name: ${name}</p>
            <p>Password: ${password}</p>
            <p>Phone: ${phone}</p>
            <p>Email: ${email}</p>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to join. Please try again later.');
    } finally {
        if (connection) connection.release();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
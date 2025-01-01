const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'abex'
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Define routes
app.get('/arrivals', (req, res) => {
    const query = 'SELECT * FROM `aggregated_arrival`';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).send('Error fetching orders');
        }
        res.json(results);
    });
});

app.get('/arrival-details/:stockId', (req, res) => {
    const { stockId } = req.params;

    const arrivalQuery = 'SELECT * FROM `aggregated_arrival` WHERE stockId = ?';
    const coffeeQuery = 'SELECT * FROM `aggregated_arrival` WHERE stockId = ?';

    db.query(arrivalQuery, [stockId], (err, arrivalResults) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).send('Error fetching order');
        }

        db.query(coffeeQuery, [stockId], (err, coffeeResults) => {
            if (err) {
                console.error('Error fetching coffee details:', err);
                return res.status(500).send('Error fetching coffee details');
            }

            res.json({
                ...arrivalResults[0],
                coffees: coffeeResults
            });
        });
    });
});

// Handle form submission
app.post('/submit', (req, res) => {
    const {
        coffeeSource,
        siteName,
        coffeeProcessing,
        grade,
        Total_KG_of_Order,
        ...properties // Capture additional properties
    } = req.body;

    const coffeeName = `${coffeeSource} ${siteName} ${coffeeProcessing} ${grade}`;

    // Insert user data into 'order'
    const userQuery = 'INSERT INTO `order` (coffeeName, Total_KG_of_Order) VALUES (?, ?)';
    db.query(userQuery, [coffeeName, Total_KG_of_Order], (err, results) => {
        if (err) {
            console.error('Error inserting order data:', err);
            return res.status(500).send('Error inserting order data');
        }

        const orderId = results.insertId; // Get the inserted orderId

        // Prepare property insertion queries
        const propertyQueries = Object.keys(properties).map((key) => {
            const order = key.match(/\d+/)[0]; // Extract order from the key
            const stockId = properties[`stockId${order}`];
            const available_coffee_BG = properties[`available_coffee_BG${order}`];
            const available_coffee_KG = properties[`available_coffee_KG${order}`];
            const coffee_name = properties[`coffee_name${order}`];
            const order_in_KG = properties[`order_in_KG${order}`];

            const propertyQuery = 'INSERT INTO ordercoffee (orderId, stockId, coffee_name ,available_coffee_BG, available_coffee_KG, order_in_KG) VALUES (?, ?, ?, ?, ?, ?)';
            return new Promise((resolve, reject) => {
                db.query(propertyQuery, [orderId, stockId, coffee_name, available_coffee_BG, available_coffee_KG, order_in_KG], (err) => {
                    if (err) {
                        console.error('Error inserting into ordercoffee:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        // Execute all property insertion queries
        Promise.all(propertyQueries)
            .then(() => {
                res.status(200).send('Order and properties inserted successfully');
            })
            .catch((err) => {
                console.error('Error inserting properties:', err);
                res.status(500).send('Error inserting properties');
            });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

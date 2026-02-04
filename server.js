const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Routes
const transactionRoutes = require('./src/routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parses incoming JSON requests

// Mount Routes
// This maps both GET and POST requests to /api/transactions
app.use('/api/transactions', transactionRoutes);

// Simple Base Route (To check if server is alive in browser)
app.get('/', (req, res) => {
    res.send('MiteeLedgerLink Backend is Running!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/api/transactions`);
});
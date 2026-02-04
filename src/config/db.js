// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,       // e.g., 'localhost'
//     user: process.env.DB_USER,       // e.g., 'root'
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,   // 'mitee_db'
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     ssl: { rejectUnauthorized: false }
// });

// module.exports = pool;
const mysql = require('mysql2/promise');
require('dotenv').config();

// --- DEBUG LOGGING (The Spy) ---
console.log("------------------------------------------------");
console.log("🔍 DEBUGGING DATABASE CONNECTION:");
console.log("HOST:", process.env.DB_HOST);     // Should be Aiven URL
console.log("USER:", process.env.DB_USER);     // Should be avnadmin
console.log("PORT:", process.env.DB_PORT);     // Should be the 5-digit number
console.log("DB:", process.env.DB_NAME);       // Should be defaultdb
console.log("SSL ENABLED:", "YES (rejectUnauthorized: false)");
console.log("------------------------------------------------");
// ------------------------------------------------

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // <--- If DB_PORT is missing, it defaults to 3306 (Wrong!)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false } // <--- CRITICAL FOR AIVEN
});

module.exports = pool;
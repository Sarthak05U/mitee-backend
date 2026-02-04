const pool = require('../config/db');

// Link Client and Agency (Safe Insert)
const linkClientAgency = async (clientId, agencyId) => {
    // INSERT IGNORE silently skips if the pair (client_id, agency_id) already exists
    const query = `
        INSERT IGNORE INTO client_agencies (client_id, agency_id)
        VALUES (?, ?)
    `;
    await pool.execute(query, [clientId, agencyId]);
};

// Create the Transaction
const createTransaction = async (clientId, agencyId, amount, mode, purpose) => {
    const query = `
        INSERT INTO transactions (client_id, agency_id, amount, payment_mode, purpose)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [clientId, agencyId, amount, mode, purpose];
    
    const [result] = await pool.execute(query, values);
    
    // Return the new ID and the data we just saved
    return {
        id: result.insertId,
        clientId,
        agencyId,
        amount,
        mode,
        purpose
    };
};

const getAllTransactions = async () => {
    // SQL JOIN to get names instead of just IDs
    const query = `
        SELECT 
            t.id, 
            c.name AS client_name, 
            a.name AS agency_name, 
            t.amount, 
            t.payment_mode, 
            t.purpose, 
            t.transaction_date
        FROM transactions t
        JOIN clients c ON t.client_id = c.id
        JOIN agencies a ON t.agency_id = a.id
        ORDER BY t.transaction_date DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
};

// ... existing imports

// NEW: Fetch all clients
const getClients = async () => {
    const [rows] = await pool.execute('SELECT id, name FROM clients ORDER BY name ASC');
    return rows;
};

// NEW: Fetch all agencies
const getAgencies = async () => {
    const [rows] = await pool.execute('SELECT id, name FROM agencies ORDER BY name ASC');
    return rows;
};

// ... existing imports

// NEW: Add a Client
const createClient = async (name, contactInfo) => {
    const query = `INSERT INTO clients (name, contact_info) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [name, contactInfo]);
    return { id: result.insertId, name, contactInfo };
};

// NEW: Add an Agency
const createAgency = async (name, serviceType) => {
    const query = `INSERT INTO agencies (name, service_type) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [name, serviceType]);
    return { id: result.insertId, name, serviceType };
};
// ... existing imports

// 1. Report: Total spent per Client
// src/models/transactionModel.js

// 1. Update getClientSummary
const getClientSummary = async (month, year) => {
    let sql = `
        SELECT c.name, COALESCE(SUM(t.amount), 0) as total_spent, COUNT(t.id) as transaction_count
        FROM clients c
        LEFT JOIN transactions t ON c.id = t.client_id
        LEFT JOIN agencies a ON t.agency_id = a.id
        WHERE (a.name IS NULL OR a.name != 'Mitee Architects') 
    `;
    
    let params = [];
    
    if (month && year) {
        // FIXED: Changed 'WHERE' to 'AND' because we already have a WHERE clause above
        sql += ` AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ? `;
        params.push(month, year);
    }
    
    sql += ` GROUP BY c.id, c.name HAVING total_spent > 0 ORDER BY total_spent DESC`;
    
    const [rows] = await pool.query(sql, params);
    return rows;
};

// 4. Get Agency Summary (Expenses Only - FIXED)
const getAgencySummary = async (month, year) => {
    let sql = `
        SELECT a.name, COALESCE(SUM(t.amount), 0) as total_received, COUNT(t.id) as transaction_count
        FROM agencies a
        LEFT JOIN transactions t ON a.id = t.agency_id
        WHERE a.name != 'Mitee Architects'
    `;
    
    let params = [];
    
    if (month && year) {
        // FIXED: Changed 'WHERE' to 'AND' here too
        sql += ` AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ? `;
        params.push(month, year);
    }
    
    sql += ` GROUP BY a.id, a.name HAVING total_received > 0 ORDER BY total_received DESC`;
    
    const [rows] = await pool.query(sql, params);
    return rows;
};
// src/controllers/transactionController.js

const getProjectStats = async (req, res) => {
    try {
        const { clientId } = req.params;

        // 1. Fetch ALL individual transactions (No GROUP BY)
        // Ordered by newest first
        const sql = `
            SELECT a.name as agency_name, t.amount, t.transaction_date, t.purpose
            FROM transactions t
            JOIN agencies a ON t.agency_id = a.id
            WHERE t.client_id = ?
            ORDER BY t.transaction_date DESC
        `;
        
        const [rows] = await pool.query(sql, [clientId]);

        let collected = 0;
        let spent = 0;
        let breakdown = [];

        // 2. Loop through rows to calculate totals AND build the list
        rows.forEach(row => {
            // If money went to YOU -> It is Income
            if (row.agency_name === 'Mitee Architects') {
                collected += parseFloat(row.amount);
            } else {
                // If money went to Vendor -> It is Expense
                spent += parseFloat(row.amount);
                breakdown.push(row); // Add this specific transaction to the list
            }
        });

        res.json({
            collected,
            spent,
            balance: collected - spent,
            breakdown // This now has Dates and Individual Amounts
        });

    } catch (error) {
        console.error("Project Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

// Update exports
module.exports = { 
    linkClientAgency, 
    createTransaction, 
    getAllTransactions, 
    getClients, 
    getAgencies,
    createClient, // <--- Added
    createAgency,
    getClientSummary, 
    getAgencySummary,
    getProjectStats   // <--- Added
};
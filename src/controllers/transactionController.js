const transactionService = require('../services/transactionService');
const transactionModel = require('../models/transactionModel');
// --- HELPER: Smart ID Resolver ---
// If 'value' is a number, it returns it (Existing ID).
// If 'value' is text, it creates a new entry and returns the NEW ID.
const resolveEntityId = async (value, type) => {
    // 1. If it's already a number (ID), just return it
    if (!isNaN(value) && parseInt(value) > 0) {
        return parseInt(value);
    }

    // 2. If it's text, Create New Record
    // type must be 'CLIENT' or 'AGENCY'
    console.log(`Auto-creating new ${type}: ${value}`);
    
    if (type === 'CLIENT') {
        const newClient = await transactionService.addNewClient({ name: value, contactInfo: '' });
        return newClient.id;
    } else {
        const newAgency = await transactionService.addNewAgency({ name: value, serviceType: '' });
        return newAgency.id;
    }
};
const createTransaction = async (req, res) => {
    try {
        let { clientId, agencyId, amount, paymentMode, purpose } = req.body;

        // Validation
        if (!amount || !clientId || !agencyId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // SMART RESOLVE: specific logic to handle "New Names" vs "Existing IDs"
        const finalClientId = await resolveEntityId(clientId, 'CLIENT');
        const finalAgencyId = await resolveEntityId(agencyId, 'AGENCY');

        const newTransaction = await transactionModel.createTransaction(
            finalClientId, 
            finalAgencyId, 
            amount, 
            paymentMode, 
            purpose
        );

        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save transaction" });
    }
};
const getTransactions = async (req, res) => {
    try {
        const history = await transactionService.getHistory();
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};


const getOptions = async (req, res) => {
    try {
        const data = await transactionService.getDropdownOptions();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch dropdown options" });
    }
};

// ... existing imports

const createClient = async (req, res) => {
    try {
        const { name, contactInfo } = req.body;
        if (!name) return res.status(400).json({ error: "Client Name is required" });

        const newClient = await transactionService.addNewClient({ name, contactInfo });
        res.status(201).json(newClient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add client" });
    }
};

const createAgency = async (req, res) => {
    try {
        const { name, serviceType } = req.body;
        if (!name) return res.status(400).json({ error: "Agency Name is required" });

        const newAgency = await transactionService.addNewAgency({ name, serviceType });
        res.status(201).json(newAgency);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add agency" });
    }
};
const viewReports = async (req, res) => {
    try {
        // 1. EXTRACT month & year from the request URL
        // (Frontend sends: /reports/view?month=2&year=2026)
        const { month, year } = req.query;
        console.log("Backend Received Filter -> Month:", month, "Year:", year);
        // 2. PASS them to the Model functions
        const clientStats = await transactionModel.getClientSummary(month, year);
        const agencyStats = await transactionModel.getAgencySummary(month, year);

        res.json({
            clientStats,
            agencyStats
        });
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};
// src/controllers/transactionController.js

const getProjectStats = async (req, res) => {
    try {
        const stats = await transactionModel.getProjectStats(req,res);
        res.json(stats);
    } catch (error) {
        console.error("Project Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch project stats" });
    }
};

// Update exports
module.exports = { 
    createTransaction, 
    getTransactions, 
    getOptions, 
    createClient, // <--- Added
    createAgency,
    viewReports,
    getProjectStats
};
const transactionModel = require('../models/transactionModel');

const addTransaction = async (data) => {
    const { clientId, agencyId, amount, paymentMode, purpose } = data;

    // Logic: 1. Ensure the Client and Agency are linked
    await transactionModel.linkClientAgency(clientId, agencyId);

    // Logic: 2. Create the transaction record
    const newTransaction = await transactionModel.createTransaction(
        clientId, 
        agencyId, 
        amount, 
        paymentMode, 
        purpose
    );

    return newTransaction;
};

const getHistory = async () => {
    return await transactionModel.getAllTransactions();
};

// NEW: Get both lists at once
const getDropdownOptions = async () => {
    const clients = await transactionModel.getClients();
    const agencies = await transactionModel.getAgencies();
    return { clients, agencies };
};

// ... existing imports

const addNewClient = async (data) => {
    return await transactionModel.createClient(data.name, data.contactInfo);
};

const addNewAgency = async (data) => {
    return await transactionModel.createAgency(data.name, data.serviceType);
};

// Update exports
module.exports = { 
    addTransaction, 
    getHistory, 
    getDropdownOptions,
    addNewClient, // <--- Added
    addNewAgency  // <--- Added
};
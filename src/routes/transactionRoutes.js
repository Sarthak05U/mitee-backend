const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const reportController = require('../controllers/reportController');

// POST: Add new
router.post('/', transactionController.createTransaction);

// GET: View History
router.get('/', transactionController.getTransactions);

// NEW: Route for Dropdowns
router.get('/options', transactionController.getOptions);
// NEW: Master Data Routes
router.post('/clients', transactionController.createClient);
router.post('/agencies', transactionController.createAgency);
router.get('/reports/view', transactionController.viewReports);      // For App Screen
router.get('/reports/download', reportController.downloadExcelReport); // For Export
router.get('/projects/:clientId/stats', transactionController.getProjectStats);
module.exports = router;
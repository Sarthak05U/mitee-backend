const transactionModel = require('../models/transactionModel');
const ExcelJS = require('exceljs');

// 1. JSON Data for App View
const getReportData = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            mode: req.query.mode
        };

        const clientStats = await transactionModel.getClientSummary(filters);
        const agencyStats = await transactionModel.getAgencySummary(filters);

        res.json({ clientStats, agencyStats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch report data" });
    }
};

// 2. Excel File Download
const downloadExcelReport = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            mode: req.query.mode
        };

        const clientStats = await transactionModel.getClientSummary(filters);
        const agencyStats = await transactionModel.getAgencySummary(filters);

        // Create Workbook
        const workbook = new ExcelJS.Workbook();
        
        // SHEET 1: Client Summary
        const clientSheet = workbook.addWorksheet('Client Summary');
        clientSheet.columns = [
            { header: 'Client Name', key: 'name', width: 30 },
            { header: 'Total Transactions', key: 'count', width: 20 },
            { header: 'Total Bill Amount (₹)', key: 'amount', width: 25 },
        ];
        clientStats.forEach(row => {
            clientSheet.addRow({ 
                name: row.name, 
                count: row.transaction_count, 
                amount: row.total_spent 
            });
        });

        // SHEET 2: Agency Summary
        const agencySheet = workbook.addWorksheet('Agency Summary');
        agencySheet.columns = [
            { header: 'Agency Name', key: 'name', width: 30 },
            { header: 'Total Transactions', key: 'count', width: 20 },
            { header: 'Total Earnings (₹)', key: 'amount', width: 25 },
        ];
        agencyStats.forEach(row => {
            agencySheet.addRow({ 
                name: row.name, 
                count: row.transaction_count, 
                amount: row.total_received 
            });
        });
        const today = new Date();
        // Creates "05-02-2026"
        const dateStr = new Date().toLocaleDateString('en-GB').split('/').join('-');
        
        // 4. Create Dynamic Filename
        const fileName = `Mitee_Ledger_Report_${dateStr}.xlsx`;
        // Send File
       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        // ✅ FIXED: Using the dynamic fileName variable here
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate Excel" });
    }
};

module.exports = { getReportData, downloadExcelReport };
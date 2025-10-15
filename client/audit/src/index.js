require('./suppress-warnings');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const StarknetContractAuditor = require('./services/auditor');
const ReportGenerator = require('./utils/reportGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/audit', async (req, res) => {
    try {
        const { contractCode } = req.body;
        const auditor = new StarknetContractAuditor(process.env.ANTHROPIC_API_KEY);
        
        const auditResult = await auditor.auditContract(contractCode);
        const reportHtml = ReportGenerator.generateHtmlReport(auditResult);
        
        res.json({
            success: true,
            report: auditResult,
            reportHtml: reportHtml
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
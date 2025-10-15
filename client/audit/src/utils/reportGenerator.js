class ReportGenerator {
    static generateHtmlReport(auditResult) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Starknet Contract Audit Report</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 1000px; margin: auto; }
                .section { 
                    border: 1px solid #ddd; 
                    margin: 10px 0; 
                    padding: 10px; 
                }
                .original-code, .corrected-code { 
                    background-color: #f4f4f4; 
                    white-space: pre-wrap; 
                    word-wrap: break-word; 
                    font-family: monospace;
                    padding: 10px;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <h1>Starknet Smart Contract Audit</h1>
            <p>Contract Name: ${auditResult.contract_name}</p>
            <p>Audit Date: ${new Date().toISOString()}</p>
            <p>Security Score: ${auditResult.security_score}/100</p>
            
            <div class="section">
                <h2>Original Contract Code</h2>
                <pre class="original-code">${auditResult.original_contract_code}</pre>
            </div>
            
            <div class="section">
                <h2>Corrected Contract Code</h2>
                <pre class="corrected-code">${auditResult.corrected_contract_code}</pre>
            </div>
            
            <div class="section">
                <h2>Vulnerabilities</h2>
                ${auditResult.vulnerabilities.map(vuln => `
                    <div class="vulnerability">
                        <h3>${vuln.category} - ${vuln.severity}</h3>
                        <p>${vuln.description}</p>
                        <pre>${vuln.recommended_fix}</pre>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <h2>Recommended Fixes</h2>
                <ul>
                    ${auditResult.recommended_fixes.map(fix => `<li>${fix}</li>`).join('')}
                </ul>
            </div>
        </body>
        </html>
        `;
    }

    static saveReport(reportHtml, filename = 'audit_report.html') {
        const fs = require('fs');
        fs.writeFileSync(filename, reportHtml);
        return filename;
    }
}

module.exports = ReportGenerator;
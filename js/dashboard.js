/**
 * Dashboard functionality
 */

function initializeDashboard() {
    const generateReportBtn = document.getElementById('generate-report');
    const clearDataBtn = document.getElementById('clear-data');
    
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
    
    // Auto-refresh dashboard stats every 30 seconds
    setInterval(window.AppUtils.updateDashboardStats, 30000);
}

async function generateReport() {
    const btn = document.getElementById('generate-report');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    try {
        const reportData = await collectReportData();
        const reportHtml = generateReportHTML(reportData);
        
        // Create and download report
        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `netsage-report-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Update stats
        const reportsCount = parseInt(localStorage.getItem('reports-count') || '0') + 1;
        localStorage.setItem('reports-count', reportsCount.toString());
        window.AppUtils.updateDashboardStats();
        
        window.AppUtils.showNotification('Report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating report:', error);
        window.AppUtils.showNotification('Error generating report: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-file-download"></i> Generate Report';
    }
}

async function collectReportData() {
    return {
        timestamp: new Date().toISOString(),
        reportId: window.AppUtils.generateReportId(),
        stats: {
            anomalies: localStorage.getItem('anomaly-count') || '0',
            lastAnalysis: localStorage.getItem('last-analysis') || 'Never',
            activeConnections: localStorage.getItem('active-connections') || '0',
            reports: localStorage.getItem('reports-count') || '0'
        },
        networkData: getStoredNetworkData(),
        analysisResults: getStoredAnalysisResults()
    };
}

function generateReportHTML(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>AI NetSage Report - ${data.reportId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-box { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI NetSage Network Analysis Report</h1>
        <p>Report ID: ${data.reportId}</p>
        <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <h3>Anomalies Detected</h3>
            <p>${data.stats.anomalies}</p>
        </div>
        <div class="stat-box">
            <h3>Last Analysis</h3>
            <p>${data.stats.lastAnalysis}</p>
        </div>
        <div class="stat-box">
            <h3>Active Connections</h3>
            <p>${data.stats.activeConnections}</p>
        </div>
        <div class="stat-box">
            <h3>Total Reports</h3>
            <p>${data.stats.reports}</p>
        </div>
    </div>
    
    <div class="section">
        <h2>Network Data Summary</h2>
        <pre>${JSON.stringify(data.networkData, null, 2)}</pre>
    </div>
    
    <div class="section">
        <h2>Analysis Results</h2>
        <pre>${JSON.stringify(data.analysisResults, null, 2)}</pre>
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            <li>Continue monitoring network traffic patterns</li>
            <li>Review anomalies detected during this period</li>
            <li>Update security configurations as needed</li>
            <li>Schedule regular analysis intervals</li>
        </ul>
    </div>
</body>
</html>`;
}

function getStoredNetworkData() {
    return JSON.parse(localStorage.getItem('network-data') || '[]');
}

function getStoredAnalysisResults() {
    return JSON.parse(localStorage.getItem('analysis-results') || '[]');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('network-data');
        localStorage.removeItem('analysis-results');
        localStorage.setItem('anomaly-count', '0');
        localStorage.setItem('last-analysis', 'Never');
        localStorage.setItem('active-connections', '0');
        
        document.getElementById('analysis-output').innerHTML = '<p class="no-data">No analysis performed yet. Upload logs or start real-time monitoring.</p>';
        
        window.AppUtils.updateDashboardStats();
        window.AppUtils.showNotification('All data cleared successfully!', 'success');
    }
}
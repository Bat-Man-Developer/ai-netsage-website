// AI NetSage Main JavaScript
class AINetSage {
    constructor() {
        this.apiBase = 'server/api.php';
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadInitialData();
        this.setupEventListeners();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.content-section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetSection = e.target.dataset.section;
                
                // Update active nav button
                navButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update active section
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(targetSection).classList.add('active');
                
                this.currentSection = targetSection;
                this.onSectionChange(targetSection);
            });
        });
    }

    onSectionChange(section) {
        switch(section) {
            case 'dashboard':
                dashboard.refresh();
                break;
            case 'models':
                models.loadSavedPrompts();
                break;
            case 'realtime':
                realtime.initialize();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    async loadInitialData() {
        try {
            await this.loadSettings();
            await dashboard.loadStats();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    setupEventListeners() {
        // API Settings Form
        document.getElementById('apiSettingsForm').addEventListener('submit', this.saveSettings.bind(this));
        document.getElementById('testConnection').addEventListener('click', this.testConnection.bind(this));
        
        // Report Generation
        document.getElementById('generateReport').addEventListener('click', this.generateReport.bind(this));
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.apiBase}?endpoint=${endpoint}`, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async loadSettings() {
        try {
            const settings = await this.apiCall('settings');
            
            if (settings.data) {
                settings.data.forEach(setting => {
                    const keyField = document.getElementById(`${setting.service_name.replace(/\s+/g, '').toLowerCase()}ApiKey`);
                    const endpointField = document.getElementById(`${setting.service_name.replace(/\s+/g, '').toLowerCase()}Endpoint`);
                    
                    if (keyField) keyField.value = setting.api_key;
                    if (endpointField) endpointField.value = setting.endpoint_url;
                });
            }
        } catch (error) {
            this.showMessage('Error loading settings', 'error');
        }
    }

    async saveSettings(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const settings = [];
        
        // IBM Granite 3.3 Instruct
        settings.push({
            service_name: 'IBM Granite 3.3 Instruct',
            api_key: formData.get('granite33_key'),
            endpoint_url: formData.get('granite33_endpoint')
        });
        
        // IBM Granite 4.0 Tiny
        settings.push({
            service_name: 'IBM Granite 4.0 Tiny',
            api_key: formData.get('granite40_key'),
            endpoint_url: formData.get('granite40_endpoint')
        });

        try {
            await this.apiCall('settings', 'POST', { settings });
            this.showMessage('Settings saved successfully', 'success');
        } catch (error) {
            this.showMessage('Error saving settings: ' + error.message, 'error');
        }
    }

    async testConnection() {
        try {
            this.showMessage('Testing connections...', 'info');
            const result = await this.apiCall('test-connection');
            
            if (result.success) {
                this.showMessage('All connections successful', 'success');
            } else {
                this.showMessage('Connection test failed: ' + result.message, 'error');
            }
        } catch (error) {
            this.showMessage('Connection test error: ' + error.message, 'error');
        }
    }

    async generateReport() {
        const reportType = document.getElementById('reportType').value;
        
        try {
            this.showMessage('Generating report...', 'info');
            const result = await this.apiCall('generate-report', 'POST', { type: reportType });
            
            if (result.success) {
                this.showMessage('Report generated successfully', 'success');
                this.loadReports();
            } else {
                this.showMessage('Report generation failed: ' + result.message, 'error');
            }
        } catch (error) {
            this.showMessage('Report generation error: ' + error.message, 'error');
        }
    }

    async loadReports() {
        try {
            const reports = await this.apiCall('reports');
            const reportsList = document.getElementById('reportsList');
            
            if (reports.data && reports.data.length > 0) {
                reportsList.innerHTML = reports.data.map(report => `
                    <div class="report-item">
                        <div class="report-info">
                            <h4>${report.report_name}</h4>
                            <div class="report-meta">
                                Type: ${report.report_type} | Created: ${new Date(report.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div class="report-actions">
                            <button class="btn-secondary" onclick="app.downloadReport(${report.id})">Download</button>
                            <button class="btn-secondary" onclick="app.viewReport(${report.id})">View</button>
                        </div>
                    </div>
                `).join('');
            } else {
                reportsList.innerHTML = '<div class="text-center">No reports generated yet</div>';
            }
        } catch (error) {
            this.showMessage('Error loading reports: ' + error.message, 'error');
        }
    }

    async downloadReport(reportId) {
        try {
            const response = await fetch(`${this.apiBase}?endpoint=download-report&id=${reportId}`);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `ai_netsage_report_${reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            this.showMessage('Error downloading report: ' + error.message, 'error');
        }
    }

    async viewReport(reportId) {
        try {
            const report = await this.apiCall(`report/${reportId}`);
            // Open report in new window or modal
            const reportWindow = window.open('', '_blank');
            reportWindow.document.write(this.formatReportHTML(report.data));
        } catch (error) {
            this.showMessage('Error viewing report: ' + error.message, 'error');
        }
    }

    formatReportHTML(reportData) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>AI NetSage Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 2rem; }
                    .header { border-bottom: 2px solid #2563eb; padding-bottom: 1rem; margin-bottom: 2rem; }
                    .section { margin-bottom: 2rem; }
                    .anomaly { padding: 1rem; border-left: 4px solid #dc2626; background: #fef2f2; margin: 1rem 0; }
                    .recommendation { padding: 1rem; border-left: 4px solid #059669; background: #f0fdf4; margin: 1rem 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>AI NetSage Network Analysis Report</h1>
                    <p>Generated: ${new Date(reportData.created_at).toLocaleString()}</p>
                </div>
                <div class="section">
                    <h2>Analysis Summary</h2>
                    <p>${reportData.report_data.summary || 'No summary available'}</p>
                </div>
                <div class="section">
                    <h2>Detected Anomalies</h2>
                    ${reportData.report_data.anomalies ? reportData.report_data.anomalies.map(a => 
                        `<div class="anomaly"><strong>${a.type}:</strong> ${a.description}</div>`
                    ).join('') : '<p>No anomalies detected</p>'}
                </div>
                <div class="section">
                    <h2>Recommendations</h2>
                    ${reportData.report_data.recommendations ? reportData.report_data.recommendations.map(r => 
                        `<div class="recommendation">${r}</div>`
                    ).join('') : '<p>No specific recommendations</p>'}
                </div>
            </body>
            </html>
        `;
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        // Find appropriate container
        const container = document.querySelector('.content-section.active') || document.body;
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }
}

// Initialize the application
const app = new AINetSage();
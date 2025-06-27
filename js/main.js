// Main Application JavaScript
class NetSageApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFileUpload();
        this.loadDashboard();
        this.startRealTimeUpdates();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.content-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show target section
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
                
                // Load section-specific content
                this.loadSectionContent(targetId);
            });
        });
    }

    setupFileUpload() {
        const dropZone = document.getElementById('file-drop-zone');
        const fileInput = document.getElementById('log-file-input');

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary-color)';
            dropZone.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
            dropZone.style.backgroundColor = 'transparent';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
            dropZone.style.backgroundColor = 'transparent';
            
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        if (files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('log_files[]', file);
        });

        try {
            this.showLoading('Uploading and processing log files...');
            const response = await ApiClient.uploadLogs(formData);
            this.hideLoading();
            
            if (response.success) {
                this.showSuccess('Log files uploaded successfully');
                this.loadAnalysisResults(response.analysis_id);
            } else {
                this.showError('Failed to upload log files: ' + response.message);
            }
        } catch (error) {
            this.hideLoading();
            this.showError('Upload failed: ' + error.message);
        }
    }

    loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'analysis':
                this.loadAnalysisHistory();
                break;
            case 'models':
                this.loadModelStatus();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    async loadDashboard() {
        try {
            const [activity, insights, trends, recommendations] = await Promise.all([
                ApiClient.getRecentActivity(),
                ApiClient.getAIInsights(),
                ApiClient.getTrendAnalysis(),
                ApiClient.getRecommendations()
            ]);

            this.updateActivityLogs(activity);
            this.updateAIInsights(insights);
            this.updateTrendAnalysis(trends);
            this.updateRecommendations(recommendations);
            this.updateStatusIndicators();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    updateActivityLogs(activities) {
        const container = document.getElementById('activity-logs');
        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="text-secondary">No recent activity</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="log-entry ${activity.severity || ''}">
                <div class="log-timestamp">${new Date(activity.timestamp).toLocaleString()}</div>
                <div class="log-message">${activity.message}</div>
            </div>
        `).join('');
    }

    updateAIInsights(insights) {
        const container = document.getElementById('ai-insights');
        if (!insights || insights.length === 0) {
            container.innerHTML = '<p class="text-secondary">No insights available</p>';
            return;
        }

        container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            </div>
        `).join('');
    }

    updateTrendAnalysis(trends) {
        const container = document.getElementById('trend-analysis');
        if (!trends || trends.length === 0) {
            container.innerHTML = '<p class="text-secondary">No trends detected</p>';
            return;
        }

        container.innerHTML = trends.map(trend => `
            <div class="insight-item">
                <div class="insight-title">${trend.pattern}</div>
                <div class="insight-description">${trend.analysis}</div>
            </div>
        `).join('');
    }

    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendations');
        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = '<p class="text-secondary">No recommendations</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <i class="fas fa-lightbulb"></i>
                <div class="recommendation-content">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-action">${rec.action}</div>
                </div>
            </div>
        `).join('');
    }

    updateStatusIndicators() {
        // Update security status
        document.getElementById('security-status').textContent = 'Normal';
        document.getElementById('monitoring-count').textContent = '12';
        document.getElementById('anomaly-count').textContent = '3';
    }

    startRealTimeUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.loadDashboard();
            }
        }, 30000);
    }

    showLoading(message) {
        // Implementation for loading indicator
        console.log('Loading:', message);
    }

    hideLoading() {
        // Implementation to hide loading indicator
        console.log('Loading complete');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            z-index: 10000;
            ${type === 'success' ? 'background-color: var(--success-color);' : 'background-color: var(--danger-color);'}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function uploadLogs() {
    document.getElementById('log-file-input').click();
}

function generateReport() {
    const timeframe = document.getElementById('report-timeframe').value;
    const type = document.getElementById('report-type').value;
    
    ApiClient.generateReport(timeframe, type)
        .then(response => {
            if (response.success) {
                app.showSuccess('Report generated successfully');
                app.loadReports();
            } else {
                app.showError('Failed to generate report');
            }
        })
        .catch(error => {
            app.showError('Report generation failed: ' + error.message);
        });
}

// Initialize application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NetSageApp();
});
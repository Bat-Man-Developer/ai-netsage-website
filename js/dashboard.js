// Dashboard functionality
class Dashboard {
    constructor() {
        this.initializeElements();
        this.loadDashboardData();
        this.startAutoRefresh();
    }

    initializeElements() {
        this.activeDevicesElement = document.getElementById('activeDevices');
        this.alertCountElement = document.getElementById('alertCount');
        this.dataTransferElement = document.getElementById('dataTransfer');
        this.reportCountElement = document.getElementById('reportCount');
        this.recentAlertsElement = document.getElementById('recentAlerts');
        this.networkChartElement = document.getElementById('networkChart');
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadRecentAlerts()
            ]);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadStats() {
        try {
            const stats = await api.getDashboardStats();
            this.updateStats(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStats(stats) {
        this.activeDevicesElement.textContent = stats.active_devices || 0;
        this.alertCountElement.textContent = stats.alert_count || 0;
        this.dataTransferElement.textContent = this.formatDataTransfer(stats.data_transfer || 0);
        this.reportCountElement.textContent = stats.report_count || 0;
    }

    async loadRecentAlerts() {
        try {
            const alerts = await api.getAlerts();
            this.renderRecentAlerts(alerts);
        } catch (error) {
            console.error('Failed to load alerts:', error);
        }
    }

    renderRecentAlerts(alerts) {
        this.recentAlertsElement.innerHTML = '';
        
        if (alerts.length === 0) {
            this.recentAlertsElement.innerHTML = '<p class="text-gray-500">No recent alerts</p>';
            return;
        }

        alerts.slice(0, 5).forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.severity}`;
            
            alertElement.innerHTML = `
                <div class="alert-icon">
                    <i class="fas fa-${this.getAlertIcon(alert.severity)}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alert.alert_type}</h4>
                    <p>${alert.message}</p>
                </div>
            `;
            
            this.recentAlertsElement.appendChild(alertElement);
        });
    }

    getAlertIcon(severity) {
        const icons = {
            'low': 'info-circle',
            'medium': 'exclamation-triangle',
            'high': 'exclamation-circle',
            'critical': 'times-circle'
        };
        return icons[severity] || 'info-circle';
    }

    formatDataTransfer(bytes) {
        if (bytes === 0) return '0 MB';
        const mb = bytes / (1024 * 1024);
        return mb.toFixed(2) + ' MB';
    }

    startAutoRefresh() {
        // Refresh dashboard data every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    initializeNetworkChart() {
        // Placeholder for network chart initialization
        this.networkChartElement.innerHTML = `
            <div style="text-align: center; color: #6b7280;">
                <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Network traffic chart will be displayed here</p>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    window.dashboard.initializeNetworkChart();
});
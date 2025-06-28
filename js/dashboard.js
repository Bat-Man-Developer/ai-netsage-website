// Dashboard Management
class Dashboard {
    constructor() {
        this.updateInterval = null;
        this.stats = {
            totalSessions: 0,
            anomalies: { critical: 0, high: 0, medium: 0, low: 0 },
            lastAnalysis: null
        };
    }

    async loadStats() {
        try {
            const stats = await app.apiCall('dashboard-stats');
            this.updateStats(stats.data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    updateStats(data) {
        if (data) {
            this.stats = { ...this.stats, ...data };
            
            // Update DOM elements
            document.getElementById('totalSessions').textContent = this.stats.totalSessions;
            document.getElementById('lastAnalysisTime').textContent = 
                this.stats.lastAnalysis ? app.formatTimestamp(this.stats.lastAnalysis) : 'Never';
            
            // Update anomaly counts
            document.getElementById('criticalAnomalies').textContent = this.stats.anomalies.critical;
            document.getElementById('highAnomalies').textContent = this.stats.anomalies.high;
            document.getElementById('mediumAnomalies').textContent = this.stats.anomalies.medium;
            document.getElementById('lowAnomalies').textContent = this.stats.anomalies.low;
        }
    }

    async loadRecentActivity() {
        try {
            const activity = await app.apiCall('recent-activity');
            const activityFeed = document.getElementById('activityFeed');
            
            if (activity.data && activity.data.length > 0) {
                activityFeed.innerHTML = activity.data.map(item => `
                    <div class="activity-item">
                        <span class="activity-time">${app.formatTimestamp(item.timestamp)}</span>
                        <span class="activity-text">${item.description}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    async loadRecentRecommendations() {
        try {
            const recommendations = await app.apiCall('recent-recommendations');
            const recommendationsList = document.getElementById('recommendationsList');
            
            if (recommendations.data && recommendations.data.length > 0) {
                recommendationsList.innerHTML = recommendations.data.map(rec => `
                    <div class="recommendation-item">
                        <span class="recommendation-type">${rec.type}</span>
                        <span class="recommendation-text">${rec.text}</span>
                        <span class="recommendation-time">${app.formatTimestamp(rec.created_at)}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    }

    startAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            this.refresh();
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    async refresh() {
        await Promise.all([
            this.loadStats(),
            this.loadRecentActivity(),
            this.loadRecentRecommendations()
        ]);
    }

    addActivityItem(description) {
        const activityFeed = document.getElementById('activityFeed');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-time">${new Date().toLocaleTimeString()}</span>
            <span class="activity-text">${description}</span>
        `;
        
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        
        // Keep only last 10 items
        const items = activityFeed.querySelectorAll('.activity-item');
        if (items.length > 10) {
            activityFeed.removeChild(items[items.length - 1]);
        }
    }

    addRecommendation(type, text) {
        const recommendationsList = document.getElementById('recommendationsList');
        const recommendationItem = document.createElement('div');
        recommendationItem.className = 'recommendation-item';
        recommendationItem.innerHTML = `
            <span class="recommendation-type">${type}</span>
            <span class="recommendation-text">${text}</span>
            <span class="recommendation-time">Just now</span>
        `;
        
        recommendationsList.insertBefore(recommendationItem, recommendationsList.firstChild);
        
        // Keep only last 5 recommendations
        const items = recommendationsList.querySelectorAll('.recommendation-item');
        if (items.length > 5) {
            recommendationsList.removeChild(items[items.length - 1]);
        }
    }

    updateAnomalyCount(severity, count) {
        const element = document.getElementById(`${severity}Anomalies`);
        if (element) {
            element.textContent = count;
            this.stats.anomalies[severity] = count;
        }
    }
}

// Initialize dashboard
const dashboard = new Dashboard();

// Start auto-refresh when dashboard is active
document.addEventListener('DOMContentLoaded', () => {
    if (app.currentSection === 'dashboard') {
        dashboard.startAutoRefresh();
    }
});
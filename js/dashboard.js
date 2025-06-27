// Dashboard-specific functionality
class Dashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.setupRealTimeUpdates();
        this.setupInteractivity();
    }

    setupRealTimeUpdates() {
        // Real-time data updates every 10 seconds
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.updateRealTimeData();
            }
        }, 10000);
    }

    setupInteractivity() {
        // Add click handlers for status cards
        document.querySelectorAll('.status-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showStatusDetails(card);
            });
        });

        // Add refresh buttons to widgets
        document.querySelectorAll('.widget').forEach(widget => {
            this.addRefreshButton(widget);
        });
    }

    addRefreshButton(widget) {
        const header = widget.querySelector('h3');
        if (header) {
            const refreshBtn = document.createElement('button');
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.className = 'widget-refresh-btn';
            refreshBtn.style.cssText = `
                float: right;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                cursor: pointer;
                font-size: 0.75rem;
            `;
            refreshBtn.onclick = () => this.refreshWidget(widget);
            header.appendChild(refreshBtn);
        }
    }

    async refreshWidget(widget) {
        const widgetId = widget.querySelector('div[id]')?.id;
        if (!widgetId) return;

        const refreshBtn = widget.querySelector('.widget-refresh-btn i');
        if (refreshBtn) {
            refreshBtn.style.animation = 'spin 1s linear infinite';
        }

        try {
            switch (widgetId) {
                case 'activity-logs':
                    const activity = await ApiClient.getRecentActivity();
                    app.updateActivityLogs(activity);
                    break;
                case 'ai-insights':
                    const insights = await ApiClient.getAIInsights();
                    app.updateAIInsights(insights);
                    break;
                case 'trend-analysis':
                    const trends = await ApiClient.getTrendAnalysis();
                    app.updateTrendAnalysis(trends);
                    break;
                case 'recommendations':
                    const recommendations = await ApiClient.getRecommendations();
                    app.updateRecommendations(recommendations);
                    break;
            }
        } catch (error) {
            console.error('Failed to refresh widget:', error);
        } finally {
            if (refreshBtn) {
                refreshBtn.style.animation = '';
            }
        }
    }

    async updateRealTimeData() {
        try {
            const realtimeData = await ApiClient.request('realtime_data');
            this.updateStatusCounters(realtimeData);
            this.updateActivityStream(realtimeData.recent_events);
        } catch (error) {
            console.error('Failed to update real-time data:', error);
        }
    }

    updateStatusCounters(data) {
        if (data.security_status) {
            document.getElementById('security-status').textContent = data.security_status;
        }
        if (data.monitoring_count !== undefined) {
            document.getElementById('monitoring-count').textContent = data.monitoring_count;
        }
        if (data.anomaly_count !== undefined) {
            document.getElementById('anomaly-count').textContent = data.anomaly_count;
        }
    }

    updateActivityStream(events) {
        if (!events || events.length === 0) return;

        const container = document.getElementById('activity-logs');
        const existingEntries = container.querySelectorAll('.log-entry');
        
        // Add new events to the top
        events.forEach(event => {
            const entry = document.createElement('div');
            entry.className = `log-entry ${event.severity || ''}`;
            entry.innerHTML = `
                <div class="log-timestamp">${new Date(event.timestamp).toLocaleString()}</div>
                <div class="log-message">${event.message}</div>
            `;
            entry.style.opacity = '0';
            entry.style.transform = 'translateY(-10px)';
            
            container.insertBefore(entry, container.firstChild);
            
            // Animate in
            setTimeout(() => {
                entry.style.transition = 'all 0.3s ease';
                entry.style.opacity = '1';
                entry.style.transform = 'translateY(0)';
            }, 100);
        });

        // Remove old entries if too many
        const allEntries = container.querySelectorAll('.log-entry');
        if (allEntries.length > 10) {
            for (let i = 10; i < allEntries.length; i++) {
                allEntries[i].remove();
            }
        }
    }

    showStatusDetails(card) {
        const label = card.querySelector('.status-label').textContent;
        const value = card.querySelector('.status-value').textContent;
        
        // Show modal or detailed view
        const modal = this.createModal(`${label} Details`, `
            <p>Current Status: <strong>${value}</strong></p>
            <p>Last Updated: ${new Date().toLocaleString()}</p>
            <p>Additional details about ${label.toLowerCase()} would be displayed here.</p>
        `);
        
        document.body.appendChild(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                padding: 2rem;
                border-radius: 0.75rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-color);
                ">
                    <h3>${title}</h3>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: var(--secondary-color);
                    ">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                modal.remove();
            }
        });
        
        return modal;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
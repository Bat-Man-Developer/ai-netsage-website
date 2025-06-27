// Dashboard module
const Dashboard = {
    updateInterval: null,
    isActive: false,

    init() {
        this.bindEvents();
        this.startAutoUpdate();
        EventBus.on('sectionChanged', (section) => {
            this.isActive = section === 'dashboard';
            if (this.isActive) {
                this.loadData();
            }
        });
    },

    bindEvents() {
        // Refresh button (if exists)
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }
    },

    async loadData() {
        try {
            // Load all dashboard data in parallel
            const [statusResult, insightsResult, modelsResult] = await Promise.all([
                api.getDashboardStatus().catch(e => handleApiError(e, 'getting dashboard status')),
                api.getInsights().catch(e => handleApiError(e, 'getting insights')),
                api.getModelStatus().catch(e => handleApiError(e, 'getting model status'))
            ]);

            if (statusResult && statusResult.success) {
                this.updateStatusCards(statusResult.data);
            }

            if (insightsResult && insightsResult.success) {
                this.updateInsights(insightsResult.data);
            }

            if (modelsResult && modelsResult.success) {
                this.updateModelStatus(modelsResult.data);
            }

        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    },

    updateStatusCards(data) {
        const elements = {
            'security-status': data.security_status || 'Unknown',
            'traffic-status': data.traffic_status || 'Unknown',
            'anomaly-count': data.anomaly_count || 0,
            'last-update': Utils.formatRelativeTime(data.last_update)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'anomaly-count' && element.textContent !== value.toString()) {
                    Utils.animateCounter(element, value);
                } else {
                    element.textContent = value;
                }
            }
        });
    },

    updateModelStatus(data) {
        // Update Granite 3.3 status
        const granite33Status = document.getElementById('granite33-status');
        const granite33Processed = document.getElementById('granite33-processed');
        
        if (granite33Status && data.granite33) {
            granite33Status.textContent = data.granite33.status === 'active' ? 'Active' : 'Inactive';
            granite33Status.className = `model-status ${data.granite33.status}`;
        }
        
        if (granite33Processed && data.granite33) {
            Utils.animateCounter(granite33Processed, data.granite33.processed_logs);
        }

        // Update Granite 4.0 status
        const granite40Status = document.getElementById('granite40-status');
        const granite40Analyzed = document.getElementById('granite40-analyzed');
        
        if (granite40Status && data.granite40) {
            granite40Status.textContent = data.granite40.status === 'active' ? 'Active' : 'Inactive';
            granite40Status.className = `model-status ${data.granite40.status}`;
        }
        
        if (granite40Analyzed && data.granite40) {
            Utils.animateCounter(granite40Analyzed, data.granite40.analyzed_patterns);
        }
    },

    updateInsights(insights) {
        const container = document.getElementById('insights-container');
        if (!container) return;

        if (!insights || insights.length === 0) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-info-circle"></i>
                    <span>No new insights available</span>
                </div>
            `;
            return;
        }

        const insightsHtml = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <div class="insight-header">
                    <span class="insight-title">${Utils.escapeHtml(insight.title)}</span>
                    <span class="insight-time">${Utils.formatRelativeTime(insight.timestamp)}</span>
                </div>
                <div class="insight-description">
                    ${Utils.escapeHtml(insight.description)}
                </div>
                <div class="insight-meta">
                    <small>Analyzed by ${insight.model} (${insight.confidence}% confidence)</small>
                </div>
                ${insight.actions && insight.actions.length > 0 ? `
                    <div class="insight-actions">
                        ${insight.actions.map(action => `
                            <a href="#" class="insight-action" onclick="Dashboard.handleInsightAction('${insight.id}', '${action}')">
                                ${action}
                            </a>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = insightsHtml;
    },

    handleInsightAction(insightId, action) {
        console.log(`Handling action "${action}" for insight ${insightId}`);
        Utils.showNotification(`Action "${action}" initiated for insight`, 'info');
        
        // Here you would implement specific actions based on the action type
        switch (action) {
            case 'Block IP':
                // Implement IP blocking logic
                break;
            case 'Monitor User':
                // Implement user monitoring logic
                break;
            case 'Generate Report':
                // Implement report generation logic
                break;
            default:
                console.log('Unknown action:', action);
        }
    },

    startAutoUpdate() {
        // Update every 30 seconds when dashboard is active
        this.updateInterval = setInterval(() => {
            if (this.isActive) {
                this.loadData();
            }
        }, 30000);
    },

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
};
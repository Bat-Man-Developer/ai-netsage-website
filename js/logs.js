// Logs module
const Logs = {
    currentLogs: [],
    searchTerm: '',
    isLoading: false,

    init() {
        this.bindEvents();
        this.loadLogs();
    },

    bindEvents() {
        const searchInput = document.getElementById('log-search');
        const refreshBtn = document.getElementById('refresh-logs');

        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchTerm = e.target.value;
                this.loadLogs();
            }, 300));
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadLogs());
        }
    },

    async loadLogs() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.updateLoadingState(true);

        try {
            const result = await api.getLogs(100, this.searchTerm);
            
            if (result && result.success) {
                this.currentLogs = result.data;
                this.displayLogs(result.data);
            } else {
                throw new Error(result.error || 'Failed to load logs');
            }
        } catch (error) {
            handleApiError(error, 'loading logs');
            this.displayError();
        } finally {
            this.isLoading = false;
            this.updateLoadingState(false);
        }
    },

    updateLoadingState(loading) {
        const refreshBtn = document.getElementById('refresh-logs');
        if (refreshBtn) {
            if (loading) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                refreshBtn.disabled = true;
            } else {
                refreshBtn.innerHTML = '<i class="fas fa-refresh"></i> Refresh';
                refreshBtn.disabled = false;
            }
        }
    },

    displayLogs(logs) {
        const container = document.getElementById('logs-container');
        if (!container) return;

        if (!logs || logs.length === 0) {
            container.innerHTML = `
                <div class="log-entry">
                    <span class="log-message">No logs found matching your criteria.</span>
                </div>
            `;
            return;
        }

        const logsHtml = logs.map(log => `
            <div class="log-entry ${log.log_level}">
                <span class="log-timestamp">${Utils.formatDate(log.timestamp)}</span>
                <span class="log-level ${log.log_level}">${log.log_level.toUpperCase()}</span>
                <span class="log-message">${Utils.escapeHtml(log.message)}</span>
                ${log.ip_address ? `<span class="log-ip">[${log.ip_address}]</span>` : ''}
            </div>
        `).join('');

        container.innerHTML = logsHtml;
    },

    displayError() {
        const container = document.getElementById('logs-container');
        if (container) {
            container.innerHTML = `
                <div class="log-entry error">
                    <span class="log-message">Failed to load logs. Please try again.</span>
                </div>
            `;
        }
    },

    // Add a new log entry (for testing or manual entry)
    async addLogEntry(level, message, ipAddress = null) {
        try {
            const logData = {
                log_level: level,
                message: message,
                ip_address: ipAddress,
                timestamp: new Date().toISOString()
            };

            const result = await api.addLog(logData);
            
            if (result && result.success) {
                Utils.showNotification('Log entry added successfully', 'success');
                this.loadLogs(); // Refresh the logs
            } else {
                throw new Error(result.error || 'Failed to add log entry');
            }
        } catch (error) {
            handleApiError(error, 'adding log entry');
        }
    }
};
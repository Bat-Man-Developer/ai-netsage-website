// API handling and AJAX functions
class API {
    constructor() {
        this.baseUrl = 'server/api/';
    }

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Network data methods
    async getNetworkDevices() {
        return this.request('network-data.php?action=devices');
    }

    async getTrafficData(deviceId = null) {
        const params = deviceId ? `?action=traffic&device_id=${deviceId}` : '?action=traffic';
        return this.request('network-data.php' + params);
    }

    async startMonitoring() {
        return this.request('network-data.php?action=start_monitoring', {
            method: 'POST'
        });
    }

    async stopMonitoring() {
        return this.request('network-data.php?action=stop_monitoring', {
            method: 'POST'
        });
    }

    // Log analysis methods
    async uploadLog(formData) {
        return this.request('analyze-logs.php?action=upload', {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type to let browser set it for FormData
        });
    }

    async analyzeLog(logId) {
        return this.request('analyze-logs.php?action=analyze', {
            method: 'POST',
            body: JSON.stringify({ log_id: logId })
        });
    }

    async getAnalysisResults() {
        return this.request('analyze-logs.php?action=results');
    }

    async getUploadedLogs() {
        return this.request('analyze-logs.php?action=logs');
    }

    async deleteLog(logId) {
        return this.request('analyze-logs.php?action=delete', {
            method: 'DELETE',
            body: JSON.stringify({ log_id: logId })
        });
    }

    // Prompts methods
    async sendPrompt(promptText, modelType) {
        return this.request('prompts.php?action=send', {
            method: 'POST',
            body: JSON.stringify({
                prompt: promptText,
                model: modelType
            })
        });
    }

    async getPromptHistory() {
        return this.request('prompts.php?action=history');
    }

    async deletePrompt(promptId) {
        return this.request('prompts.php?action=delete', {
            method: 'DELETE',
            body: JSON.stringify({ prompt_id: promptId })
        });
    }

    async clearAllPrompts() {
        return this.request('prompts.php?action=clear', {
            method: 'DELETE'
        });
    }

    // Settings methods
    async saveApiKeys(keys) {
        return this.request('settings.php?action=save_keys', {
            method: 'POST',
            body: JSON.stringify(keys)
        });
    }

    async getApiKeys() {
        return this.request('settings.php?action=get_keys');
    }

    async getDashboardStats() {
        return this.request('network-data.php?action=stats');
    }

    async getAlerts() {
        return this.request('network-data.php?action=alerts');
    }
}

// Global API instance
window.api = new API();
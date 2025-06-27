// API client for communication with backend
class ApiClient {
    constructor() {
        this.baseUrl = '/ai-netsage/server/';
        this.timeout = 30000; // 30 seconds
    }

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: AbortSignal.timeout(this.timeout),
            ...options
        };

        if (options.data) {
            config.body = JSON.stringify(options.data);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Dashboard endpoints
    async getDashboardStatus() {
        return this.request('dashboard/status');
    }

    async getInsights() {
        return this.request('dashboard/insights');
    }

    async getModelStatus() {
        return this.request('dashboard/models');
    }

    // Analysis endpoints
    async runAnalysis(timeframe = '24h') {
        return this.request('analysis/run', {
            method: 'POST',
            data: { timeframe }
        });
    }

    async getAnalysisHistory() {
        return this.request('analysis/history');
    }

    // Logs endpoints
    async getLogs(limit = 100, search = '') {
        const params = new URLSearchParams({ limit, search });
        return this.request(`logs/recent?${params}`);
    }

    async addLog(logData) {
        return this.request('logs/add', {
            method: 'POST',
            data: logData
        });
    }

    // Settings endpoints
    async getSettings() {
        return this.request('settings/get');
    }

    async updateSettings(settings) {
        return this.request('settings/update', {
            method: 'POST',
            data: settings
        });
    }
}

// Create global API instance
const api = new ApiClient();

// Error handling for API calls
function handleApiError(error, context = '') {
    console.error(`API Error ${context}:`, error);
    
    let message = 'An error occurred while communicating with the server.';
    
    if (error.name === 'AbortError') {
        message = 'Request timed out. Please try again.';
    } else if (error.message.includes('Failed to fetch')) {
        message = 'Unable to connect to server. Please check your internet connection.';
    }
    
    Utils.showNotification(message, 'error');
    return { success: false, error: message };
}

// Retry mechanism for failed requests
async function retryApiCall(apiFunction, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiFunction();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
}
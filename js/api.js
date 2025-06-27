// API Client for REST API communication
class ApiClient {
    static baseUrl = 'server/api.php';

    static async request(endpoint, options = {}) {
        const url = `${this.baseUrl}?endpoint=${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async uploadLogs(formData) {
        const url = `${this.baseUrl}?endpoint=upload_logs`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Log upload failed:', error);
            throw error;
        }
    }

    // Dashboard endpoints
    static async getRecentActivity() {
        return this.request('recent_activity');
    }

    static async getAIInsights() {
        return this.request('ai_insights');
    }

    static async getTrendAnalysis() {
        return this.request('trend_analysis');
    }

    static async getRecommendations() {
        return this.request('recommendations');
    }

    // Analysis endpoints
    static async getAnalysisResults(analysisId) {
        return this.request(`analysis_results&id=${analysisId}`);
    }

    static async getAnalysisHistory() {
        return this.request('analysis_history');
    }

    // Model endpoints
    static async queryGranite33(prompt, context = '') {
        return this.post('query_granite33', { prompt, context });
    }

    static async queryGranite40(prompt, context = '') {
        return this.post('query_granite40', { prompt, context });
    }

    static async queryCombinedModels(prompt, context = '') {
        return this.post('query_combined', { prompt, context });
    }

    static async getModelStatus() {
        return this.request('model_status');
    }

    // Reports endpoints
    static async generateReport(timeframe, type) {
        return this.post('generate_report', { timeframe, type });
    }

    static async getReports() {
        return this.request('reports');
    }

    static async downloadReport(reportId) {
        window.open(`${this.baseUrl}?endpoint=download_report&id=${reportId}`, '_blank');
    }
}
// Analysis module
const Analysis = {
    isRunning: false,
    currentTimeframe: '24h',

    init() {
        this.bindEvents();
        this.loadHistory();
    },

    bindEvents() {
        const runBtn = document.getElementById('run-analysis');
        const timeframeSelect = document.getElementById('analysis-timeframe');

        if (runBtn) {
            runBtn.addEventListener('click', () => this.runAnalysis());
        }

        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                this.currentTimeframe = e.target.value;
            });
        }
    },

    async runAnalysis() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateRunButton(true);
        Utils.showLoading();

        try {
            const result = await api.runAnalysis(this.currentTimeframe);
            
            if (result && result.success) {
                this.displayResults(result.data);
                Utils.showNotification('Analysis completed successfully', 'success');
                this.loadHistory(); // Refresh history
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            handleApiError(error, 'running analysis');
        } finally {
            this.isRunning = false;
            this.updateRunButton(false);
            Utils.hideLoading();
        }
    },

    updateRunButton(running) {
        const button = document.getElementById('run-analysis');
        if (!button) return;

        if (running) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            button.disabled = true;
        } else {
            button.innerHTML = '<i class="fas fa-play"></i> Run Analysis';
            button.disabled = false;
        }
    },

    displayResults(data) {
        const container = document.getElementById('analysis-results');
        if (!container) return;

        const resultsHtml = `
            <div class="analysis-header">
                <h3>Analysis Results - ${data.timeframe.toUpperCase()}</h3>
                <p>Generated at ${Utils.formatDate(data.generated_at)}</p>
            </div>

            <div class="analysis-summary">
                <div class="analysis-metric">
                    <span class="analysis-metric-label">Total Logs Analyzed</span>
                    <span class="analysis-metric-value">${data.total_logs_analyzed}</span>
                </div>
                <div class="analysis-metric">
                    <span class="analysis-metric-label">Overall Risk Level</span>
                    <span class="analysis-metric-value ${data.overall_risk}">${data.overall_risk.toUpperCase()}</span>
                </div>
            </div>

            <div class="analysis-section">
                <h3><i class="fas fa-brain"></i> Granite 3.3 Instruct Results</h3>
                <div class="model-results">
                    <div class="analysis-metric">
                        <span class="analysis-metric-label">Anomalies Detected</span>
                        <span class="analysis-metric-value ${this.getRiskClass(data.granite33_results.anomalies_detected)}">
                            ${data.granite33_results.anomalies_detected}
                        </span>
                    </div>
                    <div class="analysis-metric">
                        <span class="analysis-metric-label">Risk Assessment</span>
                        <span class="analysis-metric-value ${data.granite33_results.risk_level}">
                            ${data.granite33_results.risk_level.toUpperCase()}
                        </span>
                    </div>
                    <p><strong>Summary:</strong> ${data.granite33_results.summary}</p>
                    ${this.renderRecommendations(data.granite33_results.recommendations)}
                </div>
            </div>

            <div class="analysis-section">
                <h3><i class="fas fa-chart-line"></i> Granite 4.0 Tiny Results</h3>
                <div class="model-results">
                    <div class="analysis-metric">
                        <span class="analysis-metric-label">Pattern Anomalies</span>
                        <span class="analysis-metric-value ${this.getRiskClass(data.granite40_results.anomalies_detected)}">
                            ${data.granite40_results.anomalies_detected}
                        </span>
                    </div>
                    <div class="analysis-metric">
                        <span class="analysis-metric-label">Trend Assessment</span>
                        <span class="analysis-metric-value ${data.granite40_results.risk_level}">
                            ${data.granite40_results.risk_level.toUpperCase()}
                        </span>
                    </div>
                    <p><strong>Summary:</strong> ${data.granite40_results.summary}</p>
                    ${this.renderRecommendations(data.granite40_results.recommendations)}
                </div>
            </div>

            <div class="analysis-section">
                <h3><i class="fas fa-lightbulb"></i> Key Findings</h3>
                <ul class="key-findings">
                    ${data.key_findings.map(finding => `<li>${Utils.escapeHtml(finding)}</li>`).join('')}
                </ul>
            </div>
        `;

        container.innerHTML = resultsHtml;
    },

    renderRecommendations(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return '<p><em>No specific recommendations at this time.</em></p>';
        }

        return `
            <div class="recommendations">
                <strong>Recommendations:</strong>
                <ul>
                    ${recommendations.map(rec => `<li>${Utils.escapeHtml(rec)}</li>`).join('')}
                </ul>
            </div>
        `;
    },

    getRiskClass(count) {
        if (count > 3) return 'high';
        if (count > 1) return 'medium';
        return 'low';
    },

    async loadHistory() {
        try {
            const result = await api.getAnalysisHistory();
            
            if (result && result.success && result.data) {
                this.displayHistory(result.data);
            }
        } catch (error) {
            console.error('Failed to load analysis history:', error);
        }
    },

    displayHistory(history) {
        // This would render a history of previous analyses
        // For now, we'll just log it
        console.log('Analysis history:', history);
    }
};
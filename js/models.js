// AI Models Management
class ModelsManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadModelStatus();
    }

    async loadModelStatus() {
        try {
            const status = await ApiClient.getModelStatus();
            this.updateModelStatus(status);
        } catch (error) {
            console.error('Failed to load model status:', error);
        }
    }

    updateModelStatus(status) {
        // Update model status indicators
        const statusIndicator = document.querySelector('.status-indicator');
        if (status.online) {
            statusIndicator.classList.add('online');
        } else {
            statusIndicator.classList.remove('online');
        }
    }
}

// Global functions for model interactions
async function queryGranite33() {
    const prompt = document.getElementById('granite33-prompt').value.trim();
    const responseContainer = document.getElementById('granite33-response');
    
    if (!prompt) {
        app.showError('Please enter a prompt for Granite 3.3');
        return;
    }

    try {
        responseContainer.innerHTML = '<div class="loading">Processing with Granite 3.3...</div>';
        
        const response = await ApiClient.queryGranite33(prompt);
        
        if (response.success) {
            responseContainer.innerHTML = `
                <div class="model-response success">
                    <h4>Granite 3.3 Analysis:</h4>
                    <p>${response.analysis}</p>
                    ${response.recommendations ? `
                        <h5>Recommendations:</h5>
                        <ul>
                            ${response.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
            responseContainer.classList.add('success');
        } else {
            throw new Error(response.message || 'Analysis failed');
        }
    } catch (error) {
        responseContainer.innerHTML = `
            <div class="model-response error">
                <h4>Error:</h4>
                <p>${error.message}</p>
            </div>
        `;
        responseContainer.classList.add('error');
    }
}

async function queryGranite40() {
    const prompt = document.getElementById('granite40-prompt').value.trim();
    const responseContainer = document.getElementById('granite40-response');
    
    if (!prompt) {
        app.showError('Please enter a prompt for Granite 4.0');
        return;
    }

    try {
        responseContainer.innerHTML = '<div class="loading">Processing with Granite 4.0...</div>';
        
        const response = await ApiClient.queryGranite40(prompt);
        
        if (response.success) {
            responseContainer.innerHTML = `
                <div class="model-response success">
                    <h4>Granite 4.0 Pattern Analysis:</h4>
                    <p>${response.analysis}</p>
                    ${response.trends ? `
                        <h5>Detected Trends:</h5>
                        <ul>
                            ${response.trends.map(trend => `<li>${trend}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
            responseContainer.classList.add('success');
        } else {
            throw new Error(response.message || 'Analysis failed');
        }
    } catch (error) {
        responseContainer.innerHTML = `
            <div class="model-response error">
                <h4>Error:</h4>
                <p>${error.message}</p>
            </div>
        `;
        responseContainer.classList.add('error');
    }
}

async function queryCombinedModels() {
    const prompt = document.getElementById('combined-prompt').value.trim();
    const responseContainer = document.getElementById('combined-response');
    
    if (!prompt) {
        app.showError('Please enter a prompt for combined analysis');
        return;
    }

    try {
        responseContainer.innerHTML = '<div class="loading">Processing with both models...</div>';
        
        const response = await ApiClient.queryCombinedModels(prompt);
        
        if (response.success) {
            responseContainer.innerHTML = `
                <div class="combined-analysis-result">
                    <div class="granite33-section">
                        <h4><i class="fas fa-brain"></i> Granite 3.3 Insights:</h4>
                        <p>${response.granite33_analysis}</p>
                    </div>
                    <div class="granite40-section">
                        <h4><i class="fas fa-chart-line"></i> Granite 4.0 Patterns:</h4>
                        <p>${response.granite40_analysis}</p>
                    </div>
                    <div class="combined-section">
                        <h4><i class="fas fa-cogs"></i> Combined Recommendations:</h4>
                        <ul>
                            ${response.combined_recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        } else {
            throw new Error(response.message || 'Combined analysis failed');
        }
    } catch (error) {
        responseContainer.innerHTML = `
            <div class="error">
                <h4>Error:</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Initialize models manager
document.addEventListener('DOMContentLoaded', () => {
    new ModelsManager();
});
// Main application logic
class App {
    constructor() {
        this.currentTab = 'dashboard';
        this.initializeNavigation();
        this.initializePrompts();
        this.initializeSettings();
        this.loadInitialData();
    }

    initializeNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;

        // Initialize tab-specific functionality
        this.initializeTabContent(tabId);
    }

    initializeTabContent(tabId) {
        switch (tabId) {
            case 'monitor':
                if (window.networkMonitor) {
                    window.networkMonitor.initialize();
                }
                break;
            case 'analyzer':
                if (window.logAnalyzer) {
                    window.logAnalyzer.loadUploadedFiles();
                    window.logAnalyzer.loadAnalysisResults();
                }
                break;
            case 'prompts':
                this.loadPromptHistory();
                break;
            case 'settings':
                this.loadApiKeys();
                break;
        }
    }

    initializePrompts() {
        const sendPromptBtn = document.getElementById('sendPrompt');
        const promptTextarea = document.getElementById('promptText');
        const clearPromptsBtn = document.getElementById('clearPrompts');

        sendPromptBtn.addEventListener('click', () => this.sendPrompt());
        promptTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.sendPrompt();
            }
        });
        clearPromptsBtn.addEventListener('click', () => this.clearAllPrompts());
    }

    async sendPrompt() {
        const promptText = document.getElementById('promptText').value.trim();
        const selectedModel = document.querySelector('input[name="model"]:checked').value;

        if (!promptText) {
            alert('Please enter a prompt');
            return;
        }

        try {
            this.showLoading();
            const result = await api.sendPrompt(promptText, selectedModel);
            document.getElementById('promptText').value = '';
            this.loadPromptHistory();
            console.log('Prompt sent successfully:', result);
        } catch (error) {
            console.error('Failed to send prompt:', error);
            alert('Failed to send prompt: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadPromptHistory() {
        try {
            const prompts = await api.getPromptHistory();
            this.renderPromptHistory(prompts);
        } catch (error) {
            console.error('Failed to load prompt history:', error);
        }
    }

    renderPromptHistory(prompts) {
        const historyContainer = document.getElementById('promptHistory');
        historyContainer.innerHTML = '';

        if (prompts.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500">No prompts yet</p>';
            return;
        }

        prompts.forEach(prompt => {
            const promptElement = document.createElement('div');
            promptElement.className = 'prompt-item';
            
            promptElement.innerHTML = `
                <div class="prompt-header">
                    <div>
                        <strong>${prompt.model_type.replace('_', ' ').toUpperCase()}</strong>
                        <small>${new Date(prompt.created_at).toLocaleString()}</small>
                    </div>
                    <button class="btn btn-danger" onclick="app.deletePrompt(${prompt.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="prompt-content">
                    <div class="prompt-text">${prompt.prompt_text}</div>
                    <div class="prompt-response">${prompt.response || 'No response yet'}</div>
                    ${prompt.processing_time ? `<small>Processing time: ${prompt.processing_time}s</small>` : ''}
                </div>
            `;
            
            historyContainer.appendChild(promptElement);
        });
    }

    async deletePrompt(promptId) {
        if (!confirm('Are you sure you want to delete this prompt?')) return;
        
        try {
            await api.deletePrompt(promptId);
            this.loadPromptHistory();
        } catch (error) {
            console.error('Failed to delete prompt:', error);
            alert('Failed to delete prompt: ' + error.message);
        }
    }

    async clearAllPrompts() {
        if (!confirm('Are you sure you want to clear all prompts? This action cannot be undone.')) return;
        
        try {
            await api.clearAllPrompts();
            this.loadPromptHistory();
        } catch (error) {
            console.error('Failed to clear prompts:', error);
            alert('Failed to clear prompts: ' + error.message);
        }
    }

    initializeSettings() {
        const saveApiKeysBtn = document.getElementById('saveApiKeys');
        saveApiKeysBtn.addEventListener('click', () => this.saveApiKeys());
    }

    async saveApiKeys() {
        const granite33Key = document.getElementById('granite33Key').value.trim();
        const granite40Key = document.getElementById('granite40Key').value.trim();

        if (!granite33Key || !granite40Key) {
            alert('Please enter both API keys');
            return;
        }

        try {
            const keys = {
                ibm_granite_3_3: granite33Key,
                ibm_granite_4_0: granite40Key
            };
            
            await api.saveApiKeys(keys);
            alert('API keys saved successfully');
        } catch (error) {
            console.error('Failed to save API keys:', error);
            alert('Failed to save API keys: ' + error.message);
        }
    }

    async loadApiKeys() {
        try {
            const keys = await api.getApiKeys();
            document.getElementById('granite33Key').value = keys.ibm_granite_3_3 || '';
            document.getElementById('granite40Key').value = keys.ibm_granite_4_0 || '';
        } catch (error) {
            console.error('Failed to load API keys:', error);
        }
    }

    async loadInitialData() {
        // Load initial dashboard data
        if (window.dashboard) {
            await window.dashboard.loadDashboardData();
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
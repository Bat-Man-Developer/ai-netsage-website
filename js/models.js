// AI Models Management
class ModelsManager {
    constructor() {
        this.savedPrompts = [];
        this.init();
    }

    init() {
        this.setupForms();
        this.loadSavedPrompts();
    }

    setupForms() {
        // IBM Granite 3.3 Instruct Form
        document.getElementById('granite33Form').addEventListener('submit', (e) => {
            this.handleModelSubmit(e, 'granite_33');
        });

        // IBM Granite 4.0 Tiny Form
        document.getElementById('granite40Form').addEventListener('submit', (e) => {
            this.handleModelSubmit(e, 'granite_40');
        });

        // Combined Models Form
        document.getElementById('combinedForm').addEventListener('submit', (e) => {
            this.handleModelSubmit(e, 'combined');
        });
    }

    async handleModelSubmit(e, modelType) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const prompt = formData.get('prompt');
        const saveName = formData.get('save_name');
        
        if (!prompt.trim()) {
            app.showMessage('Please enter a prompt', 'error');
            return;
        }

        const responseElement = document.getElementById(`${modelType.replace('_', '')}Response`);
        responseElement.innerHTML = '<div class="loading"></div> Processing...';

        try {
            // Save prompt if name provided
            if (saveName && saveName.trim()) {
                await this.savePrompt(saveName.trim(), prompt, modelType);
            }

            // Submit prompt to model
            const result = await app.apiCall('model-prompt', 'POST', {
                model: modelType,
                prompt: prompt
            });

            if (result.success) {
                responseElement.innerHTML = this.formatModelResponse(result.data);
                dashboard.addActivityItem(`${modelType.replace('_', ' ')} analysis completed`);
                
                // Add recommendations if any
                if (result.data.recommendations) {
                    result.data.recommendations.forEach(rec => {
                        dashboard.addRecommendation('AI Model', rec);
                    });
                }
            } else {
                responseElement.innerHTML = `Error: ${result.message}`;
            }
        } catch (error) {
            responseElement.innerHTML = `Error: ${error.message}`;
            app.showMessage('Model request failed: ' + error.message, 'error');
        }
    }

    formatModelResponse(data) {
        let html = '';
        
        if (data.analysis) {
            html += `<div class="response-section">
                <h4>Analysis:</h4>
                <p>${data.analysis}</p>
            </div>`;
        }

        if (data.anomalies && data.anomalies.length > 0) {
            html += `<div class="response-section">
                <h4>Anomalies Detected:</h4>
                <ul>
                    ${data.anomalies.map(anomaly => `<li>${anomaly}</li>`).join('')}
                </ul>
            </div>`;
        }

        if (data.recommendations && data.recommendations.length > 0) {
            html += `<div class="response-section">
                <h4>Recommendations:</h4>
                <ul>
                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>`;
        }

        if (data.raw_response) {
            html += `<div class="response-section">
                <h4>Full Response:</h4>
                <pre>${data.raw_response}</pre>
            </div>`;
        }

        return html || 'No response received';
    }

    async savePrompt(name, prompt, modelType) {
        try {
            await app.apiCall('save-prompt', 'POST', {
                name: name,
                prompt: prompt,
                model_type: modelType
            });
            
            app.showMessage('Prompt saved successfully', 'success');
            this.loadSavedPrompts();
        } catch (error) {
            app.showMessage('Error saving prompt: ' + error.message, 'error');
        }
    }

    async loadSavedPrompts(filterType = null) {
        try {
            const prompts = await app.apiCall('saved-prompts');
            this.savedPrompts = prompts.data || [];
            
            if (filterType) {
                this.showSavedPromptsModal(filterType);
            }
        } catch (error) {
            console.error('Error loading saved prompts:', error);
        }
    }

    showSavedPromptsModal(modelType) {
        const filteredPrompts = this.savedPrompts.filter(p => p.model_type === modelType);
        
        if (filteredPrompts.length === 0) {
            app.showMessage('No saved prompts for this model type', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Saved Prompts - ${modelType.replace('_', ' ').toUpperCase()}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="prompts-list">
                        ${filteredPrompts.map(prompt => `
                            <div class="prompt-item" data-prompt-id="${prompt.id}">
                                <div class="prompt-header">
                                    <h4>${prompt.prompt_name}</h4>
                                    <span class="prompt-usage">Used ${prompt.used_count} times</span>
                                </div>
                                <div class="prompt-preview">${prompt.prompt_text.substring(0, 100)}...</div>
                                <div class="prompt-actions">
                                    <button class="btn-primary" onclick="models.loadPrompt('${modelType}', ${prompt.id})">Load</button>
                                    <button class="btn-secondary" onclick="models.deletePrompt(${prompt.id})">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    loadPrompt(modelType, promptId) {
        const prompt = this.savedPrompts.find(p => p.id === promptId);
        if (prompt) {
            const textareaId = `${modelType.replace('_', '')}Prompt`;
            const textarea = document.getElementById(textareaId);
            if (textarea) {
                textarea.value = prompt.prompt_text;
                
                // Close modal
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    document.body.removeChild(modal);
                }
                
                app.showMessage('Prompt loaded successfully', 'success');
            }
        }
    }

    async deletePrompt(promptId) {
        if (confirm('Are you sure you want to delete this prompt?')) {
            try {
                await app.apiCall('delete-prompt', 'POST', { id: promptId });
                app.showMessage('Prompt deleted successfully', 'success');
                this.loadSavedPrompts();
                
                // Close modal
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    document.body.removeChild(modal);
                }
            } catch (error) {
                app.showMessage('Error deleting prompt: ' + error.message, 'error');
            }
        }
    }
}

// Global function for loading saved prompts (called from HTML)
function loadSavedPrompts(modelType) {
    models.loadSavedPrompts(modelType);
}

// Initialize models manager
const models = new ModelsManager();

// Add modal styles
const modalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: var(--bg-primary);
    border-radius: var(--border-radius-lg);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
}

.modal-body {
    padding: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
}

.prompt-item {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    margin-bottom: 1rem;
}

.prompt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.prompt-header h4 {
    margin: 0;
    color: var(--text-primary);
}

.prompt-usage {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.prompt-preview {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-size: 0.875rem;
}

.prompt-actions {
    display: flex;
    gap: 0.5rem;
}

.prompt-actions button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.response-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.response-section:last-child {
    border-bottom: none;
}

.response-section h4 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.response-section ul {
    margin-left: 1.5rem;
}

.response-section pre {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: var(--border-radius);
    overflow-x: auto;
    font-size: 0.875rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);
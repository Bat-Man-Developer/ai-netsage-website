/**
 * Main application JavaScript
 */

// Global variables
let isMonitoring = false;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    loadConfiguration();
    updateDashboardStats();
    
    // Initialize all modules
    initializeDashboard();
    initializeModels();
    initializeFileUpload();
    initializeNetworkMonitor();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav
            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

async function testConnection() {
    try {
        const response = await fetch('../server/connection.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'test' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Database connection successful!', 'success');
        } else {
            showNotification('Database connection failed: ' + result.message, 'error');
        }
        
    } catch (error) {
        showNotification('Connection test failed: ' + error.message, 'error');
    }
}

async function loadConfiguration() {
    try {
        // Try to load from database first
        const response = await fetch('../server/config.php', {
            method: 'GET'
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // Load from database
            Object.keys(result.data).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = result.data[key];
                }
            });
        } else {
            // Fallback to localStorage
            const savedConfig = localStorage.getItem('ai-netsage-config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                Object.keys(config).forEach(key => {
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = config[key];
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Fallback to localStorage
        const savedConfig = localStorage.getItem('ai-netsage-config');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            Object.keys(config).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = config[key];
                }
            });
        }
    }
}

async function saveConfiguration() {
    const config = {
        'project-id': document.getElementById('project-id').value,
        'endpoint-url': document.getElementById('endpoint-url').value,
        'api-key': document.getElementById('api-key').value,
        'granite33-model': document.getElementById('granite33-model').value,
        'granite40-model': document.getElementById('granite40-model').value,
        'iam-token': document.getElementById('iam-token').value
    };
    
    try {
        const response = await fetch('../server/config.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                configs: Object.entries(config).map(([key, value]) => ({
                    id: key,
                    value: value
                }))
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Also save to localStorage as backup
            localStorage.setItem('ai-netsage-config', JSON.stringify(config));
            showNotification('Configuration saved successfully!', 'success');
        } else {
            showNotification('Failed to save configuration: ' + result.message, 'error');
        }
        
    } catch (error) {
        showNotification('Error saving configuration: ' + error.message, 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Add click to dismiss
    notification.addEventListener('click', function() {
        this.classList.remove('show');
        this.classList.add('hide');
        setTimeout(() => {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        }, 300);
    });
}

function updateDashboardStats() {
    // Update stats from localStorage or API
    const stats = {
        anomalies: localStorage.getItem('anomaly-count') || '0',
        lastAnalysis: localStorage.getItem('last-analysis') || 'Never',
        activeConnections: localStorage.getItem('active-connections') || '0',
        reports: localStorage.getItem('reports-count') || '0'
    };
    
    document.getElementById('anomaly-count').textContent = stats.anomalies;
    document.getElementById('last-analysis').textContent = stats.lastAnalysis;
    document.getElementById('active-connections').textContent = stats.activeConnections;
    document.getElementById('reports-count').textContent = stats.reports;
}

// Placeholder functions for missing modules
function initializeDashboard() {
    // Dashboard initialization
    const generateReportBtn = document.getElementById('generate-report');
    const clearDataBtn = document.getElementById('clear-data');
    
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            showNotification('Report generation started...', 'info');
        });
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function() {
            localStorage.clear();
            updateDashboardStats();
            showNotification('Data cleared successfully!', 'success');
        });
    }
}

function initializeModels() {
    // Model forms initialization
    const granite33Form = document.getElementById('granite33-form');
    const granite40Form = document.getElementById('granite40-form');
    const combinedForm = document.getElementById('combined-form');
    
    if (granite33Form) {
        granite33Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const prompt = this.querySelector('textarea[name="prompt"]').value;
            runModelAnalysis('granite33', prompt, 'granite33-output');
        });
    }
    
    if (granite40Form) {
        granite40Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const prompt = this.querySelector('textarea[name="prompt"]').value;
            runModelAnalysis('granite40', prompt, 'granite40-output');
        });
    }
    
    if (combinedForm) {
        combinedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const prompt = this.querySelector('textarea[name="prompt"]').value;
            runCombinedAnalysis(prompt);
        });
    }
}

function initializeFileUpload() {
    // File upload initialization
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('file-drop-zone');
    
    if (dropZone) {
        dropZone.addEventListener('click', function() {
            fileInput.click();
        });
        
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', function() {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            handleFileUpload(files);
        });
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const files = fileInput.files;
            handleFileUpload(files);
        });
    }
}

async function runModelAnalysis(modelType, prompt, outputElementId) {
    const outputElement = document.getElementById(outputElementId);
    outputElement.innerHTML = '<p>Processing...</p>';
    
    // Add context prompts for network security analysis
    const securityContextPrefix = "You are a Human Network Security Analyst with expertise in cybersecurity, threat detection, and network analysis. Please analyze the following from a network security perspective:\n\n";
    const securityContextSuffix = "\n\nPlease provide your analysis considering network security implications, potential threats, vulnerabilities, and recommended security measures.";
    
    const enhancedPrompt = securityContextPrefix + prompt + securityContextSuffix;
    
    try {
        const response = await fetch('../call_python/ibm_granite_models/ibm_granite_models.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_type: modelType,
                prompt: enhancedPrompt
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            outputElement.innerHTML = `<pre>${result.response}</pre>`;
        } else {
            outputElement.innerHTML = `<p class="error">Error: ${result.error}</p>`;
        }
        
    } catch (error) {
        outputElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

async function runCombinedAnalysis(prompt) {
    const outputElement = document.getElementById('combined-output');
    outputElement.innerHTML = '<p>Running combined analysis...</p>';
    
    // Add context prompts for network security analysis
    const securityContextPrefix = "You are a Human Network Security Analyst with expertise in cybersecurity, threat detection, and network analysis. Please analyze the following from a network security perspective:\n\n";
    const securityContextSuffix = "\n\nPlease provide your analysis considering network security implications, potential threats, vulnerabilities, and recommended security measures.";
    
    const enhancedPrompt = securityContextPrefix + prompt + securityContextSuffix;
    
    try {
        // Run both models
        const granite33Response = await fetch('../call_python/ibm_granite_models/ibm_granite_models.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_type: 'granite33',
                prompt: enhancedPrompt
            })
        });
        
        const granite40Response = await fetch('../call_python/ibm_granite_models/ibm_granite_models.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_type: 'granite40',
                prompt: enhancedPrompt
            })
        });
        
        const granite33Result = await granite33Response.json();
        const granite40Result = await granite40Response.json();
        
        let combinedOutput = '<h4>Combined Analysis Results</h4>';
        
        if (granite33Result.success) {
            combinedOutput += '<h5>Granite 3.3 Analysis:</h5>';
            combinedOutput += `<pre>${granite33Result.response}</pre>`;
        }
        
        if (granite40Result.success) {
            combinedOutput += '<h5>Granite 4.0 Analysis:</h5>';
            combinedOutput += `<pre>${granite40Result.response}</pre>`;
        }
        
        outputElement.innerHTML = combinedOutput;
        
    } catch (error) {
        outputElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

async function handleFileUpload(files) {
    if (files.length === 0) return;
    
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = progressContainer.querySelector('.progress-fill');
    const progressText = progressContainer.querySelector('.progress-text');
    
    progressContainer.style.display = 'block';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            progressText.textContent = `Uploading ${file.name}...`;
            progressFill.style.width = `${((i + 1) / files.length) * 100}%`;
            
            const response = await fetch('../call_python/file_upload/file_upload.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(`File ${file.name} uploaded successfully!`, 'success');
                
                // Trigger security analysis of uploaded file
                await analyzeUploadedFile(file.name, result.file_path || file.name);
            } else {
                showNotification(`Error uploading ${file.name}: ${result.error}`, 'error');
            }
            
        } catch (error) {
            showNotification(`Error uploading ${file.name}: ${error.message}`, 'error');
        }
    }
    
    progressContainer.style.display = 'none';
}

async function analyzeUploadedFile(fileName, filePath) {
    const securityAnalysisPrompt = `You are a Human Network Security Analyst. A file named "${fileName}" has been uploaded to the system at path "${filePath}". 

Please perform a comprehensive security analysis of this uploaded file including:

1. File type and extension security assessment
2. Potential malware or threat indicators
3. File size and content anomaly detection
4. Upload source verification recommendations
5. Quarantine and scanning procedures
6. Integration with existing security protocols
7. Risk level assessment and classification

Provide detailed security recommendations for handling this uploaded file and any immediate actions that should be taken from a network security perspective.`;

    try {
        const response = await fetch('../call_python/ibm_granite_models/ibm_granite_models.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_type: 'granite40', // Use default model for file analysis
                prompt: securityAnalysisPrompt
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Display the security analysis in a dedicated section
            const analysisContainer = document.getElementById('file-security-analysis') || createFileAnalysisContainer();
            analysisContainer.innerHTML += `
                <div class="file-analysis-result">
                    <h4>Security Analysis for: ${fileName}</h4>
                    <pre>${result.response}</pre>
                    <hr>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error analyzing uploaded file:', error);
    }
}

function createFileAnalysisContainer() {
    const container = document.createElement('div');
    container.id = 'file-security-analysis';
    container.innerHTML = '<h3>File Security Analysis Results</h3>';
    document.body.appendChild(container);
    return container;
}

// Utility functions
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function generateReportId() {
    return 'RPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Configuration form handler
document.addEventListener('DOMContentLoaded', function() {
    const configForm = document.getElementById('config-form');
    const testConnectionBtn = document.getElementById('test-connection');
    
    if (configForm) {
        configForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveConfiguration();
        });
    }
    
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', function() {
            testConnection();
        });
    }
});

// Export for other modules
window.AppUtils = {
    showNotification,
    updateDashboardStats,
    formatTimestamp,
    generateReportId,
    saveConfiguration
};
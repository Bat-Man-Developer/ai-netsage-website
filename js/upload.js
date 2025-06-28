// File Upload Management
class UploadManager {
    constructor() {
        this.supportedFormats = ['.pcap', '.pcapng', '.cap', '.log', '.txt', '.csv', '.json', '.xml'];
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.init();
    }

    init() {
        this.setupUploadArea();
        this.setupFileInput();
    }

    setupUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    setupFileInput() {
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        if (files.length === 0) return;

        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        });

        if (errors.length > 0) {
            app.showMessage('File validation errors:\n' + errors.join('\n'), 'error');
        }

        if (validFiles.length > 0) {
            this.uploadFiles(validFiles);
        }
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `File too large (max ${app.formatBytes(this.maxFileSize)})`
            };
        }

        // Check file extension
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.supportedFormats.includes(extension)) {
            return {
                valid: false,
                error: `Unsupported format. Supported: ${this.supportedFormats.join(', ')}`
            };
        }

        return { valid: true };
    }

    async uploadFiles(files) {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const analysisResults = document.getElementById('analysisResults');

        uploadProgress.style.display = 'block';
        analysisResults.innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                // Update progress
                const progress = Math.round(((i + 0.5) / files.length) * 100);
                progressFill.style.width = progress + '%';
                progressText.textContent = `Uploading ${file.name}... ${progress}%`;

                // Upload file
                const result = await this.uploadSingleFile(file);
                
                if (result.success) {
                    // Analyze uploaded file
                    progressText.textContent = `Analyzing ${file.name}...`;
                    const analysis = await this.analyzeFile(result.file_id);
                    
                    // Display results
                    this.displayAnalysisResult(file.name, analysis);
                    
                    // Update dashboard
                    dashboard.addActivityItem(`Log file ${file.name} analyzed`);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                this.displayError(file.name, error.message);
            }
        }

        // Final progress update
        progressFill.style.width = '100%';
        progressText.textContent = 'Upload and analysis complete';
        
        // Hide progress after 3 seconds
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 3000);
    }

    async uploadSingleFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', this.getFileType(file.name));

        const response = await fetch('server/upload.php', {
            method: 'POST',
            body: formData
        });

        return await response.json();
    }

    async analyzeFile(fileId) {
        return await app.apiCall('analyze-file', 'POST', {
            file_id: fileId,
            analysis_type: 'full'
        });
    }

    getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'pcap': 'Wireshark Capture',
            'pcapng': 'Wireshark Capture (Next Gen)',
            'cap': 'Network Capture',
            'log': 'Log File',
            'txt': 'Text Log',
            'csv': 'CSV Data',
            'json': 'JSON Data',
            'xml': 'XML Data'
        };
        
        return typeMap[extension] || 'Unknown';
    }

    displayAnalysisResult(filename, analysis) {
        const analysisResults = document.getElementById('analysisResults');
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.innerHTML = `
            <div class="result-header">
                <span class="result-title">Analysis: ${filename}</span>
                <span class="result-timestamp">${new Date().toLocaleString()}</span>
            </div>
            <div class="result-content">
                ${this.formatAnalysisContent(analysis.data)}
            </div>
        `;
        
        analysisResults.appendChild(resultCard);

        // Update anomaly counts if any detected
        if (analysis.data.anomalies) {
            analysis.data.anomalies.forEach(anomaly => {
                dashboard.updateAnomalyCount(anomaly.severity, 
                    (dashboard.stats.anomalies[anomaly.severity] || 0) + 1);
            });
        }

        // Add recommendations
        if (analysis.data.recommendations) {
            analysis.data.recommendations.forEach(rec => {
                dashboard.addRecommendation('File Analysis', rec);
            });
        }
    }

    formatAnalysisContent(data) {
        let html = '';

        if (data.summary) {
            html += `<div class="analysis-section">
                <h4>Summary</h4>
                <p>${data.summary}</p>
            </div>`;
        }

        if (data.statistics) {
            html += `<div class="analysis-section">
                <h4>Statistics</h4>
                <ul>
                    ${Object.entries(data.statistics).map(([key, value]) => 
                        `<li><strong>${key}:</strong> ${value}</li>`
                    ).join('')}
                </ul>
            </div>`;
        }

        if (data.anomalies && data.anomalies.length > 0) {
            html += `<div class="analysis-section">
                <h4>Anomalies Detected</h4>
                <div class="anomalies-list">
                    ${data.anomalies.map(anomaly => `
                        <div class="anomaly-item ${anomaly.severity}">
                            <span class="anomaly-type">${anomaly.type}</span>
                            <span class="anomaly-description">${anomaly.description}</span>
                            <span class="anomaly-confidence">Confidence: ${(anomaly.confidence * 100).toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        if (data.recommendations && data.recommendations.length > 0) {
            html += `<div class="analysis-section">
                <h4>Recommendations</h4>
                <ul>
                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>`;
        }

        if (data.technical_details) {
            html += `<div class="analysis-section">
                <h4>Technical Details</h4>
                <pre class="technical-details">${JSON.stringify(data.technical_details, null, 2)}</pre>
            </div>`;
        }

        return html || '<p>No analysis data available</p>';
    }

    displayError(filename, error) {
        const analysisResults = document.getElementById('analysisResults');
        
        const errorCard = document.createElement('div');
        errorCard.className = 'result-card error';
        errorCard.innerHTML = `
            <div class="result-header">
                <span class="result-title">Error: ${filename}</span>
                <span class="result-timestamp">${new Date().toLocaleString()}</span>
            </div>
            <div class="result-content">
                <div class="error-message">${error}</div>
            </div>
        `;
        
        analysisResults.appendChild(errorCard);
    }
}

// Initialize upload manager
const upload = new UploadManager();

// Add upload-specific styles
const uploadStyles = `
<style>
.analysis-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.analysis-section:last-child {
    border-bottom: none;
}

.analysis-section h4 {
    color: var(--primary-color);
    margin-bottom: 0.75rem;
    font-size: 1rem;
}

.anomalies-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.anomaly-item {
    padding: 1rem;
    border-radius: var(--border-radius);
    border-left: 4px solid;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.anomaly-item.critical {
    border-color: var(--critical-color);
    background: rgb(153 27 27 / 0.1);
}

.anomaly-item.high {
    border-color: var(--error-color);
    background: rgb(220 38 38 / 0.1);
}

.anomaly-item.medium {
    border-color: var(--warning-color);
    background: rgb(217 119 6 / 0.1);
}

.anomaly-item.low {
    border-color: var(--success-color);
    background: rgb(5 150 105 / 0.1);
}

.anomaly-type {
    font-weight: 600;
    color: var(--text-primary);
}

.anomaly-description {
    color: var(--text-secondary);
}

.anomaly-confidence {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.technical-details {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: var(--border-radius);
    overflow-x: auto;
    font-size: 0.875rem;
    max-height: 300px;
    overflow-y: auto;
}

.result-card.error {
    border-left: 4px solid var(--error-color);
}

.drag-over {
    border-color: var(--primary-color) !important;
    background: rgb(37 99 235 / 0.05) !important;
}

@media (max-width: 768px) {
    .anomaly-item {
        padding: 0.75rem;
    }
    
    .technical-details {
        font-size: 0.8rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', uploadStyles);
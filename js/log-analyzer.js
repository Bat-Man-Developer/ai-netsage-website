// Log analysis functionality
class LogAnalyzer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadUploadedFiles();
        this.loadAnalysisResults();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('logFileInput');
        this.uploadedFilesList = document.getElementById('uploadedFilesList');
        this.analysisResults = document.getElementById('analysisResults');
    }

    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        this.uploadFiles(files);
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.uploadFiles(files);
    }

    async uploadFiles(files) {
        for (let file of files) {
            await this.uploadSingleFile(file);
        }
        this.loadUploadedFiles();
    }

    async uploadSingleFile(file) {
        const formData = new FormData();
        formData.append('logFile', file);

        try {
            this.showLoading();
            const result = await api.uploadLog(formData);
            console.log('File uploaded successfully:', result);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadUploadedFiles() {
        try {
            const files = await api.getUploadedLogs();
            this.renderUploadedFiles(files);
        } catch (error) {
            console.error('Failed to load uploaded files:', error);
        }
    }

    renderUploadedFiles(files) {
        this.uploadedFilesList.innerHTML = '';
        
        if (files.length === 0) {
            this.uploadedFilesList.innerHTML = '<p class="text-gray-500">No files uploaded yet</p>';
            return;
        }

        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            
            fileElement.innerHTML = `
                <div class="file-info">
                    <h4>${file.filename}</h4>
                    <p>Size: ${this.formatFileSize(file.file_size)} • Type: ${file.file_type}</p>
                    <small>Uploaded: ${new Date(file.upload_timestamp).toLocaleString()}</small>
                </div>
                <div class="file-actions">
                    <button class="btn btn-primary" onclick="logAnalyzer.analyzeFile(${file.id})">
                        <i class="fas fa-brain"></i>
                        Analyze
                    </button>
                    <button class="btn btn-danger" onclick="logAnalyzer.deleteFile(${file.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            `;
            
            this.uploadedFilesList.appendChild(fileElement);
        });
    }

    async analyzeFile(fileId) {
        try {
            this.showLoading();
            const result = await api.analyzeLog(fileId);
            console.log('Analysis completed:', result);
            this.loadAnalysisResults();
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;
        
        try {
            await api.deleteLog(fileId);
            this.loadUploadedFiles();
            this.loadAnalysisResults();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Delete failed: ' + error.message);
        }
    }

    async loadAnalysisResults() {
        try {
            const results = await api.getAnalysisResults();
            this.renderAnalysisResults(results);
        } catch (error) {
            console.error('Failed to load analysis results:', error);
        }
    }

    renderAnalysisResults(results) {
        this.analysisResults.innerHTML = '';
        
        if (results.length === 0) {
            this.analysisResults.innerHTML = '<p class="text-gray-500">No analysis results yet</p>';
            return;
        }

        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'analysis-result';
            
            resultElement.innerHTML = `
                <div class="result-header">
                    <h4>Analysis Report #${result.id}</h4>
                    <small>${new Date(result.created_at).toLocaleString()}</small>
                </div>
                <div class="result-content">
                    <div class="model-response">
                        <h4>IBM Granite 3.3 Instruct Analysis:</h4>
                        <p>${result.granite_3_3_analysis || 'No analysis available'}</p>
                    </div>
                    <div class="model-response">
                        <h4>IBM Granite 4.0 Tiny Analysis:</h4>
                        <p>${result.granite_4_0_analysis || 'No analysis available'}</p>
                    </div>
                    <div class="model-response">
                        <h4>Combined Report:</h4>
                        <p>${result.combined_report || 'No combined report available'}</p>
                    </div>
                    <div class="model-response">
                        <h4>Recommendations:</h4>
                        <p>${result.recommendations || 'No recommendations available'}</p>
                    </div>
                    <p><strong>Anomalies Detected:</strong> ${result.anomalies_detected || 0}</p>
                </div>
            `;
            
            this.analysisResults.appendChild(resultElement);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.logAnalyzer = new LogAnalyzer();
});
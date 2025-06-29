/**
 * File Upload functionality
 */

function initializeFileUpload() {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('file-drop-zone');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFileUpload);
    }
    
    if (dropZone) {
        setupDragAndDrop(dropZone, fileInput);
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
}

function setupDragAndDrop(dropZone, fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        fileInput.files = files;
        handleFileSelection({ target: { files } });
    });
}

function handleFileSelection(e) {
    const files = e.target.files;
    const dropZone = document.getElementById('file-drop-zone');
    
    if (files.length > 0) {
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        dropZone.querySelector('p').textContent = `Selected: ${fileNames}`;
    }
}

async function handleFileUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('file-input');
    const files = fileInput.files;
    
    if (files.length === 0) {
        window.AppUtils.showNotification('Please select files to upload', 'warning');
        return;
    }
    
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = progressContainer.querySelector('.progress-fill');
    const progressText = progressContainer.querySelector('.progress-text');
    
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading...';
    
    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await uploadFile(file, (progress) => {
                const totalProgress = ((i + progress) / files.length) * 100;
                progressFill.style.width = totalProgress + '%';
                progressText.textContent = `Uploading ${file.name}... ${Math.round(progress)}%`;
            });
        }
        
        progressFill.style.width = '100%';
        progressText.textContent = 'Upload complete!';
        
        window.AppUtils.showNotification('Files uploaded successfully!', 'success');
        
        // Check if immediate analysis is requested
        const analyzeImmediately = document.querySelector('input[name="analyze_immediately"]').checked;
        if (analyzeImmediately) {
            await analyzeUploadedFiles(files);
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        window.AppUtils.showNotification('Upload failed: ' + error.message, 'error');
    } finally {
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 2000);
    }
}

async function uploadFile(file, progressCallback) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                progressCallback(progress);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.error || 'Upload failed'));
                    }
                } catch (error) {
                    reject(new Error('Invalid response from server'));
                }
            } else {
                reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });
        
        xhr.open('POST', '../call_python/file_upload/uploadFile.php');
        xhr.send(formData);
    });
}

async function analyzeUploadedFiles(files) {
    try {
        window.AppUtils.showNotification('Starting analysis...', 'info');
        
        const analysisPrompt = `Analyze the uploaded network log files: ${Array.from(files).map(f => f.name).join(', ')}. 
        Look for security anomalies, unusual traffic patterns, and potential threats.`;
        
        const response = await callGraniteModel('granite33', analysisPrompt);
        
        // Display results in dashboard
        const analysisOutput = document.getElementById('analysis-output');
        analysisOutput.innerHTML = `
            <h4>Analysis of Uploaded Files</h4>
            <p><strong>Files:</strong> ${Array.from(files).map(f => f.name).join(', ')}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <div style="margin-top: 1rem;">
                <strong>Results:</strong>
                <pre>${response}</pre>
            </div>
        `;
        
        // Store analysis results
        const analysisResults = JSON.parse(localStorage.getItem('analysis-results') || '[]');
        analysisResults.push({
            timestamp: new Date().toISOString(),
            files: Array.from(files).map(f => f.name),
            results: response
        });
        localStorage.setItem('analysis-results', JSON.stringify(analysisResults));
        
        // Update stats
        localStorage.setItem('last-analysis', new Date().toLocaleString());
        window.AppUtils.updateDashboardStats();
        
        window.AppUtils.showNotification('Analysis completed!', 'success');
        
    } catch (error) {
        console.error('Analysis error:', error);
        window.AppUtils.showNotification('Analysis failed: ' + error.message, 'error');
    }
}
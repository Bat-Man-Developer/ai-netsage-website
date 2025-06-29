<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI NetSage - Intelligent Network Analysis</title>
    <link rel="stylesheet" href="assets/styles/main.css">
    <link rel="stylesheet" href="assets/styles/dashboard.css">
    <link rel="stylesheet" href="assets/styles/forms.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header class="main-header">
        <div class="container">
            <h1><i class="fas fa-network-wired"></i> AI NetSage</h1>
            <p>Intelligent Network Analysis Platform</p>
        </div>
    </header>

    <nav class="main-nav">
        <div class="container">
            <ul>
                <li><a href="#dashboard" class="nav-link active">Dashboard</a></li>
                <li><a href="#models" class="nav-link">Model Testing</a></li>
                <li><a href="#upload" class="nav-link">Log Upload</a></li>
                <li><a href="#monitor" class="nav-link">Real-time Monitor</a></li>
                <li><a href="#config" class="nav-link">Configuration</a></li>
            </ul>
        </div>
    </nav>

    <main class="main-content">
        <!-- Dashboard Section -->
        <section id="dashboard" class="content-section active">
            <div class="container">
                <h2>Network Analysis Dashboard</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Anomalies Detected</h3>
                        <span id="anomaly-count">0</span>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <h3>Last Analysis</h3>
                        <span id="last-analysis">Never</span>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-network-wired"></i>
                        <h3>Active Connections</h3>
                        <span id="active-connections">0</span>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-file-alt"></i>
                        <h3>Reports Generated</h3>
                        <span id="reports-count">0</span>
                    </div>
                </div>

                <div class="analysis-results">
                    <h3>Latest Analysis Results</h3>
                    <div id="analysis-output" class="output-container">
                        <p class="no-data">No analysis performed yet. Upload logs or start real-time monitoring.</p>
                    </div>
                </div>

                <div class="actions">
                    <button id="generate-report" class="btn btn-primary">
                        <i class="fas fa-file-download"></i> Generate Report
                    </button>
                    <button id="clear-data" class="btn btn-secondary">
                        <i class="fas fa-trash"></i> Clear Data
                    </button>
                </div>
            </div>
        </section>

        <!-- Model Testing Section -->
        <section id="models" class="content-section">
            <div class="container">
                <h2>IBM Model Testing</h2>
                
                <div class="models-grid">
                    <!-- Granite 3.3 Instruct -->
                    <div class="model-card">
                        <h3><i class="fas fa-brain"></i> IBM Granite 3.3 Instruct</h3>
                        <p>Primary Reasoning Engine</p>
                        <form id="granite33-form" class="model-form">
                            <textarea name="prompt" placeholder="Enter your network analysis prompt..." required></textarea>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-play"></i> Run Analysis
                            </button>
                        </form>
                        <div id="granite33-output" class="model-output"></div>
                    </div>

                    <!-- Granite 4.0 Tiny -->
                    <div class="model-card">
                        <h3><i class="fas fa-chart-line"></i> IBM Granite 4.0 Tiny</h3>
                        <p>Long-Context Pattern Analysis</p>
                        <form id="granite40-form" class="model-form">
                            <textarea name="prompt" placeholder="Enter your pattern analysis prompt..." required></textarea>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-play"></i> Run Analysis
                            </button>
                        </form>
                        <div id="granite40-output" class="model-output"></div>
                    </div>

                    <!-- Combined Models -->
                    <div class="model-card full-width">
                        <h3><i class="fas fa-layer-group"></i> Combined Model Analysis</h3>
                        <p>Comprehensive network intelligence using both models</p>
                        <form id="combined-form" class="model-form">
                            <textarea name="prompt" placeholder="Enter your comprehensive analysis prompt..." required></textarea>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-play"></i> Run Combined Analysis
                            </button>
                        </form>
                        <div id="combined-output" class="model-output"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Log Upload Section -->
        <section id="upload" class="content-section">
            <div class="container">
                <h2>Network Log Upload</h2>
                
                <div class="upload-container">
                    <form id="upload-form" enctype="multipart/form-data">
                        <div class="file-drop-zone" id="file-drop-zone">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop network log files here or click to browse</p>
                            <p class="file-types">Supported: .pcap, .pcapng, .cap, .log, .txt, .csv, .json, .xml</p>
                            <input type="file" id="file-input" name="log_files[]" multiple accept=".pcap,.pcapng,.cap,.log,.txt,.csv,.json,.xml">
                        </div>
                        
                        <div class="upload-options">
                            <label>
                                <input type="checkbox" name="analyze_immediately" checked>
                                Analyze immediately after upload
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-upload"></i> Upload and Analyze
                        </button>
                    </form>
                    
                    <div id="upload-progress" class="progress-container" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <p class="progress-text">Uploading...</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Real-time Monitor Section -->
        <section id="monitor" class="content-section">
            <div class="container">
                <h2>Real-time Network Monitor</h2>
                
                <div class="monitor-controls">
                    <button id="start-monitoring" class="btn btn-success">
                        <i class="fas fa-play"></i> Start Monitoring
                    </button>
                    <button id="stop-monitoring" class="btn btn-danger" disabled>
                        <i class="fas fa-stop"></i> Stop Monitoring
                    </button>
                    <button id="pause-monitoring" class="btn btn-warning" disabled>
                        <i class="fas fa-pause"></i> Pause
                    </button>
                </div>

                <div class="monitor-status">
                    <div class="status-indicator" id="monitor-status">
                        <span class="status-dot"></span>
                        <span class="status-text">Disconnected</span>
                    </div>
                </div>

                <div class="network-data">
                    <h3>Live Network Traffic</h3>
                    <div id="network-log" class="network-log-container">
                        <p class="no-data">Start monitoring to see real-time network data</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Configuration Section -->
        <section id="config" class="content-section">
            <div class="container">
                <h2>Watson AI Configuration</h2>
                
                <form id="config-form" class="config-form">
                    <div class="config-grid">
                        <div class="config-group">
                            <label for="project-id">Project ID</label>
                            <input type="text" id="project-id" name="project_id" value="bb2265fb-2e89-474b-a008-867cd95613c0" required>
                        </div>
                        
                        <div class="config-group">
                            <label for="endpoint-url">Endpoint URL</label>
                            <input type="url" id="endpoint-url" name="endpoint_url" value="https://us-south.ml.cloud.ibm.com" required>
                        </div>
                        
                        <div class="config-group">
                            <label for="api-key">API Key</label>
                            <input type="password" id="api-key" name="api_key" value="wCVB8UKj_DB4YrPaJHLrZGDpALJWx6nil594HnwxN3Zv" required>
                        </div>
                        
                        <div class="config-group">
                            <label for="granite33-model">Granite 3.3 Model ID</label>
                            <input type="text" id="granite33-model" name="granite33_model" value="ibm/granite-3-3-8b-instruct" required>
                        </div>
                        
                        <div class="config-group">
                            <label for="granite40-model">Granite 4.0 Model ID</label>
                            <input type="text" id="granite40-model" name="granite40_model" value="ibm/granite-4-0-tiny" required>
                        </div>

                        <div class="config-group">
                            <label for="iam-token">IAM Token</label>
                            <input type="password" id="iam-token" name="iam_token" value="eyJraWQiOiIyMDE5MDcyNCIsImFsZyI6IlJTMjU2In0.eyJpYW1faWQiOiJJQk1pZC02OTgwMDBaOTA1IiwiaWQiOiJJQk1pZC02OTgwMDBaOTA1IiwicmVhbG1pZCI6IklCTWlkIiwic2Vzc2lvbl9pZCI6IkMtNzRlYjFhZjYtYWY0ZC00N2YxLTlkYmItMzk4MzE3MjAyOTY1Iiwic2Vzc2lvbl9leHBfbWF4IjoxNzUxMjc1Njk0LCJzZXNzaW9uX2V4cF9uZXh0IjoxNzUxMTk3NDM3LCJqdGkiOiJjMmY2ZDg4Ni1mZjFhLTQ5ZjYtYjZiNS1lMWJlOGM1ZmM5ZjQiLCJpZGVudGlmaWVyIjoiNjk4MDAwWjkwNSIsImdpdmVuX25hbWUiOiJLYXkiLCJmYW1pbHlfbmFtZSI6Ik11ZGF1IiwibmFtZSI6IktheSBNdWRhdSIsImVtYWlsIjoia2theS5tdWRhdTAwOEBnbWFpbC5jb20iLCJzdWIiOiJra2F5Lm11ZGF1MDA4QGdtYWlsLmNvbSIsImF1dGhuIjp7InN1YiI6ImtrYXkubXVkYXUwMDhAZ21haWwuY29tIiwiaWFtX2lkIjoiSUJNaWQtNjk4MDAwWjkwNSIsIm5hbWUiOiJLYXkgTXVkYXUiLCJnaXZlbl9uYW1lIjoiS2F5IiwiZmFtaWx5X25hbWUiOiJNdWRhdSIsImVtYWlsIjoia2theS5tdWRhdTAwOEBnbWFpbC5jb20ifSwiYWNjb3VudCI6eyJ2YWxpZCI6dHJ1ZSwiYnNzIjoiMTE2NGNkMjlhMzY1NDJjN2EzYmUyOTI4YjYxZDI1NDciLCJpbXNfdXNlcl9pZCI6IjEzOTQ0Mzk3IiwiaW1zIjoiMzAwMDA4NCJ9LCJpYXQiOjE3NTExOTAyMzQsImV4cCI6MTc1MTE5MTQzNCwiaXNzIjoiaHR0cHM6Ly9pYW0uY2xvdWQuaWJtLmNvbS9pZGVudGl0eSIsImdyYW50X3R5cGUiOiJ1cm46aWJtOnBhcmFtczpvYXV0aDpncmFudC10eXBlOnBhc3Njb2RlIiwic2NvcGUiOiJpYm0gb3BlbmlkIiwiY2xpZW50X2lkIjoiYngiLCJhY3IiOjEsImFtciI6WyJwd2QiXX0.MbF7BE8gNmRKfV2ZyEjCov8nGO9pSsoYjvBkTBfDLMAsEoNiENQTKX4t3EW6q5YH9jlqwfJq35H1dnh7PkPcPki1M5XA39Xttjqcfig2r9Pn6fmLQ5vqbduQBR2VO8YGDdK6TQqSiOfwOw8dyJH3hTDOniR6eZcxVJLpau-tFOZI53ZalZmHKjIGwax9KBehjz73Sm_EyBiYMmrHa4ZihEtZzlk629WtukdFD5qyk0OS_X1IfMM6QpWJfSRss_QihdQ90UmvaMtWn8s3O9LeQ2jUEXdmgmXyqHsl7dC6WXSZHr7XHcTL_sTF4srbeQztpy1xZkW6Q-RU7GT0inIIyw" required>
                        </div>
                    </div>
                    
                    <div class="config-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Configuration
                        </button>
                        <button type="button" id="test-connection" class="btn btn-secondary">
                            <i class="fas fa-plug"></i> Test Connection
                        </button>
                        
                    </div>
                </form>
            </div>
        </section>
    </main>

    <footer class="main-footer">
        <div class="container">
            <p>&copy; 2025 AI NetSage. Enterprise Network Intelligence Platform.</p>
        </div>
    </footer>
    
    <script src="js/main.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/models.js"></script>
    <script src="js/network-monitor.js"></script>
    <script src="js/file-upload.js"></script>
</body>
</html>
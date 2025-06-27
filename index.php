<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI NetSage - Intelligent Network Analysis</title>
    <link rel="stylesheet" href="assets/styles/main.css">
    <link rel="stylesheet" href="assets/styles/dashboard.css">
    <link rel="stylesheet" href="assets/styles/components.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header class="main-header">
        <nav class="navbar">
            <div class="nav-brand">
                <i class="fas fa-network-wired"></i>
                <span>AI NetSage</span>
            </div>
            <ul class="nav-menu">
                <li><a href="#dashboard" class="nav-link active">Dashboard</a></li>
                <li><a href="#analysis" class="nav-link">Analysis</a></li>
                <li><a href="#models" class="nav-link">AI Models</a></li>
                <li><a href="#reports" class="nav-link">Reports</a></li>
            </ul>
        </nav>
    </header>

    <main class="main-content">
        <!-- Dashboard Section -->
        <section id="dashboard" class="content-section active">
            <div class="dashboard-header">
                <h1>Network Intelligence Dashboard</h1>
                <div class="status-indicators">
                    <div class="status-card">
                        <i class="fas fa-shield-alt"></i>
                        <span class="status-label">Security Status</span>
                        <span class="status-value" id="security-status">Normal</span>
                    </div>
                    <div class="status-card">
                        <i class="fas fa-eye"></i>
                        <span class="status-label">Active Monitoring</span>
                        <span class="status-value" id="monitoring-count">0</span>
                    </div>
                    <div class="status-card">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span class="status-label">Anomalies</span>
                        <span class="status-value" id="anomaly-count">0</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="widget">
                    <h3>Recent Network Activity</h3>
                    <div id="activity-logs" class="log-container">
                        <div class="loading">Loading network activity...</div>
                    </div>
                </div>

                <div class="widget">
                    <h3>AI Analysis Results</h3>
                    <div id="ai-insights" class="insights-container">
                        <div class="loading">Processing AI insights...</div>
                    </div>
                </div>

                <div class="widget">
                    <h3>Trend Analysis</h3>
                    <div id="trend-analysis" class="trends-container">
                        <div class="loading">Analyzing patterns...</div>
                    </div>
                </div>

                <div class="widget">
                    <h3>Recommended Actions</h3>
                    <div id="recommendations" class="recommendations-container">
                        <div class="loading">Generating recommendations...</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Analysis Section -->
        <section id="analysis" class="content-section">
            <div class="section-header">
                <h1>Network Log Analysis</h1>
                <button class="btn btn-primary" onclick="uploadLogs()">
                    <i class="fas fa-upload"></i>
                    Upload Logs
                </button>
            </div>

            <div class="analysis-controls">
                <div class="file-upload-area" id="file-drop-zone">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drop log files here or click to browse</p>
                    <input type="file" id="log-file-input" multiple accept=".log,.txt,.csv">
                </div>

                <div class="analysis-options">
                    <label>
                        <input type="checkbox" id="real-time-analysis" checked>
                        Real-time Analysis
                    </label>
                    <label>
                        <input type="checkbox" id="historical-comparison" checked>
                        Historical Comparison
                    </label>
                    <label>
                        <input type="checkbox" id="anomaly-detection" checked>
                        Anomaly Detection
                    </label>
                </div>
            </div>

            <div class="analysis-results" id="analysis-results">
                <!-- Results will be populated here -->
            </div>
        </section>

        <!-- AI Models Section -->
        <section id="models" class="content-section">
            <div class="section-header">
                <h1>AI Model Management</h1>
                <div class="model-status">
                    <span class="status-indicator online"></span>
                    Models Online
                </div>
            </div>

            <div class="models-grid">
                <div class="model-card">
                    <div class="model-header">
                        <h3>IBM Granite 3.3 Instruct</h3>
                        <span class="model-tag primary">Primary Reasoning</span>
                    </div>
                    <div class="model-description">
                        <p>Core reasoning engine for analyzing network logs and generating actionable insights.</p>
                    </div>
                    <div class="model-controls">
                        <textarea id="granite33-prompt" placeholder="Enter your analysis prompt for Granite 3.3..." rows="4"></textarea>
                        <button class="btn btn-primary" onclick="queryGranite33()">
                            <i class="fas fa-brain"></i>
                            Analyze with Granite 3.3
                        </button>
                    </div>
                    <div class="model-response" id="granite33-response"></div>
                </div>

                <div class="model-card">
                    <div class="model-header">
                        <h3>IBM Granite 4.0 Tiny</h3>
                        <span class="model-tag secondary">Pattern Analysis</span>
                    </div>
                    <div class="model-description">
                        <p>Long-context model for trend detection and historical pattern analysis.</p>
                    </div>
                    <div class="model-controls">
                        <textarea id="granite40-prompt" placeholder="Enter your pattern analysis prompt for Granite 4.0..." rows="4"></textarea>
                        <button class="btn btn-secondary" onclick="queryGranite40()">
                            <i class="fas fa-chart-line"></i>
                            Analyze with Granite 4.0
                        </button>
                    </div>
                    <div class="model-response" id="granite40-response"></div>
                </div>
            </div>

            <div class="combined-analysis">
                <h3>Combined Model Analysis</h3>
                <p>Use both models together for comprehensive network intelligence</p>
                <textarea id="combined-prompt" placeholder="Enter comprehensive analysis prompt..." rows="3"></textarea>
                <button class="btn btn-success" onclick="queryCombinedModels()">
                    <i class="fas fa-cogs"></i>
                    Run Combined Analysis
                </button>
                <div class="combined-response" id="combined-response"></div>
            </div>
        </section>

        <!-- Reports Section -->
        <section id="reports" class="content-section">
            <div class="section-header">
                <h1>Analysis Reports</h1>
                <button class="btn btn-primary" onclick="generateReport()">
                    <i class="fas fa-file-alt"></i>
                    Generate New Report
                </button>
            </div>

            <div class="reports-filters">
                <select id="report-timeframe">
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                </select>
                <select id="report-type">
                    <option value="security">Security Analysis</option>
                    <option value="performance">Performance Report</option>
                    <option value="comprehensive">Comprehensive Report</option>
                </select>
            </div>

            <div class="reports-list" id="reports-list">
                <!-- Reports will be populated here -->
            </div>
        </section>
    </main>

    <footer class="main-footer">
        <p>&copy; 2025 AI NetSage. Enterprise Network Intelligence Platform.</p>
    </footer>

    <script src="js/main.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/api.js"></script>
    <script src="js/models.js"></script>
</body>
</html>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI NetSage - Intelligent Network Analysis</title>
    <link rel="stylesheet" href="assets/styles/main.css">
    <link rel="stylesheet" href="assets/styles/dashboard.css">
    <link rel="stylesheet" href="assets/styles/forms.css">
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>">
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="main-header">
            <div class="header-content">
                <div class="logo">
                    <h1>AI NetSage</h1>
                    <span class="tagline">Intelligent Network Analysis</span>
                </div>
                <nav class="main-nav">
                    <button class="nav-btn active" data-section="dashboard">Dashboard</button>
                    <button class="nav-btn" data-section="models">AI Models</button>
                    <button class="nav-btn" data-section="upload">Log Analysis</button>
                    <button class="nav-btn" data-section="realtime">Real-time Monitor</button>
                    <button class="nav-btn" data-section="reports">Reports</button>
                    <button class="nav-btn" data-section="settings">Settings</button>
                </nav>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Dashboard Section -->
            <section id="dashboard" class="content-section active">
                <div class="dashboard-grid">
                    <div class="stats-card">
                        <h3>System Status</h3>
                        <div class="status-indicator">
                            <span class="status-dot online"></span>
                            <span>Online</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Last Analysis:</span>
                            <span class="stat-value" id="lastAnalysisTime">--</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Sessions:</span>
                            <span class="stat-value" id="totalSessions">0</span>
                        </div>
                    </div>

                    <div class="stats-card">
                        <h3>Anomaly Detection</h3>
                        <div class="anomaly-summary">
                            <div class="anomaly-count critical">
                                <span class="count" id="criticalAnomalies">0</span>
                                <span class="label">Critical</span>
                            </div>
                            <div class="anomaly-count high">
                                <span class="count" id="highAnomalies">0</span>
                                <span class="label">High</span>
                            </div>
                            <div class="anomaly-count medium">
                                <span class="count" id="mediumAnomalies">0</span>
                                <span class="label">Medium</span>
                            </div>
                            <div class="anomaly-count low">
                                <span class="count" id="lowAnomalies">0</span>
                                <span class="label">Low</span>
                            </div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <h3>Real-time Activity</h3>
                        <div class="activity-feed" id="activityFeed">
                            <div class="activity-item">Monitoring initialized...</div>
                        </div>
                    </div>

                    <div class="stats-card full-width">
                        <h3>Recent Recommendations</h3>
                        <div class="recommendations-list" id="recommendationsList">
                            <div class="recommendation-item">
                                <span class="recommendation-type">Security</span>
                                <span class="recommendation-text">System monitoring active</span>
                                <span class="recommendation-time">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- AI Models Section -->
            <section id="models" class="content-section">
                <div class="models-container">
                    <h2>AI Model Interface</h2>
                    
                    <!-- IBM Granite 3.3 Instruct -->
                    <div class="model-card">
                        <h3>IBM Granite 3.3 Instruct 8B</h3>
                        <p class="model-description">Primary reasoning engine for real-time log analysis and anomaly detection</p>
                        <form class="model-form" id="granite33Form">
                            <div class="form-group">
                                <label for="granite33Prompt">Prompt:</label>
                                <textarea id="granite33Prompt" name="prompt" rows="4" placeholder="Enter your analysis prompt..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="granite33SavePrompt">Save Prompt As:</label>
                                <input type="text" id="granite33SavePrompt" name="save_name" placeholder="Optional: Save this prompt for later use">
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">Analyze</button>
                                <button type="button" class="btn-secondary" onclick="loadSavedPrompts('granite_33')">Load Saved</button>
                            </div>
                        </form>
                        <div class="model-response" id="granite33Response"></div>
                    </div>

                    <!-- IBM Granite 4.0 Tiny -->
                    <div class="model-card">
                        <h3>IBM Granite 4.0 Tiny</h3>
                        <p class="model-description">Long-context pattern analysis for historical trend detection</p>
                        <form class="model-form" id="granite40Form">
                            <div class="form-group">
                                <label for="granite40Prompt">Prompt:</label>
                                <textarea id="granite40Prompt" name="prompt" rows="4" placeholder="Enter your trend analysis prompt..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="granite40SavePrompt">Save Prompt As:</label>
                                <input type="text" id="granite40SavePrompt" name="save_name" placeholder="Optional: Save this prompt for later use">
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">Analyze</button>
                                <button type="button" class="btn-secondary" onclick="loadSavedPrompts('granite_40')">Load Saved</button>
                            </div>
                        </form>
                        <div class="model-response" id="granite40Response"></div>
                    </div>

                    <!-- Combined Models -->
                    <div class="model-card">
                        <h3>Combined Analysis</h3>
                        <p class="model-description">Comprehensive analysis using both models for complete network intelligence</p>
                        <form class="model-form" id="combinedForm">
                            <div class="form-group">
                                <label for="combinedPrompt">Prompt:</label>
                                <textarea id="combinedPrompt" name="prompt" rows="4" placeholder="Enter your comprehensive analysis prompt..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="combinedSavePrompt">Save Prompt As:</label>
                                <input type="text" id="combinedSavePrompt" name="save_name" placeholder="Optional: Save this prompt for later use">
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">Analyze</button>
                                <button type="button" class="btn-secondary" onclick="loadSavedPrompts('combined')">Load Saved</button>
                            </div>
                        </form>
                        <div class="model-response" id="combinedResponse"></div>
                    </div>
                </div>
            </section>

            <!-- Log Upload Section -->
            <section id="upload" class="content-section">
                <div class="upload-container">
                    <h2>Log File Analysis</h2>
                    <div class="upload-card">
                        <div class="upload-area" id="uploadArea">
                            <div class="upload-icon">📁</div>
                            <h3>Upload Network Logs</h3>
                            <p>Supported formats: .pcap, .pcapng, .cap, .log, .txt, .csv, .json, .xml</p>
                            <input type="file" id="fileInput" multiple accept=".pcap,.pcapng,.cap,.log,.txt,.csv,.json,.xml">
                            <button class="btn-primary" onclick="document.getElementById('fileInput').click()">Choose Files</button>
                        </div>
                        <div class="upload-progress" id="uploadProgress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <span class="progress-text" id="progressText">0%</span>
                        </div>
                    </div>
                    <div class="analysis-results" id="analysisResults"></div>
                </div>
            </section>

            <!-- Real-time Monitoring Section -->
            <section id="realtime" class="content-section">
                <div class="realtime-container">
                    <h2>Real-time Network Monitoring</h2>
                    <div class="monitoring-controls">
                        <button id="startMonitoring" class="btn-primary">Start Monitoring</button>
                        <button id="stopMonitoring" class="btn-secondary" disabled>Stop Monitoring</button>
                        <div class="monitor-status">
                            <span class="status-indicator" id="monitorStatus">Stopped</span>
                        </div>
                    </div>
                    <div class="monitoring-grid">
                        <div class="monitor-card">
                            <h3>Network Traffic</h3>
                            <div class="traffic-stats">
                                <div class="stat">
                                    <span class="stat-label">Inbound:</span>
                                    <span class="stat-value" id="inboundTraffic">0 MB</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Outbound:</span>
                                    <span class="stat-value" id="outboundTraffic">0 MB</span>
                                </div>
                            </div>
                        </div>
                        <div class="monitor-card">
                            <h3>Active Connections</h3>
                            <div class="connections-list" id="connectionsList"></div>
                        </div>
                        <div class="monitor-card full-width">
                            <h3>Live Traffic Log</h3>
                            <div class="traffic-log" id="trafficLog"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Reports Section -->
            <section id="reports" class="content-section">
                <div class="reports-container">
                    <h2>Analysis Reports</h2>
                    <div class="report-controls">
                        <button class="btn-primary" id="generateReport">Generate New Report</button>
                        <select id="reportType">
                            <option value="daily">Daily Report</option>
                            <option value="weekly">Weekly Report</option>
                            <option value="custom">Custom Report</option>
                        </select>
                    </div>
                    <div class="reports-list" id="reportsList"></div>
                </div>
            </section>

            <!-- Settings Section -->
            <section id="settings" class="content-section">
                <div class="settings-container">
                    <h2>API Configuration</h2>
                    <form id="apiSettingsForm" class="settings-form">
                        <div class="api-config">
                            <h3>IBM Granite 3.3 Instruct</h3>
                            <div class="form-group">
                                <label for="granite33ApiKey">API Key:</label>
                                <input type="password" id="granite33ApiKey" name="granite33_key" placeholder="Enter API key">
                            </div>
                            <div class="form-group">
                                <label for="granite33Endpoint">Endpoint URL:</label>
                                <input type="url" id="granite33Endpoint" name="granite33_endpoint" placeholder="https://api.ibm.com/granite/3.3/instruct">
                            </div>
                        </div>
                        
                        <div class="api-config">
                            <h3>IBM Granite 4.0 Tiny</h3>
                            <div class="form-group">
                                <label for="granite40ApiKey">API Key:</label>
                                <input type="password" id="granite40ApiKey" name="granite40_key" placeholder="Enter API key">
                            </div>
                            <div class="form-group">
                                <label for="granite40Endpoint">Endpoint URL:</label>
                                <input type="url" id="granite40Endpoint" name="granite40_endpoint" placeholder="https://api.ibm.com/granite/4.0/tiny">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Save Configuration</button>
                            <button type="button" class="btn-secondary" id="testConnection">Test Connection</button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    </div>

    <!-- Scripts -->
    <script src="js/main.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/models.js"></script>
    <script src="js/upload.js"></script>
    <script src="js/realtime.js"></script>
</body>
</html>
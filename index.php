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
    <div class="app-container">
        <!-- Header -->
        <header class="main-header">
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-network-wired"></i>
                    <h1>AI NetSage</h1>
                </div>
                <nav class="main-nav">
                    <button class="nav-btn active" data-tab="dashboard">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </button>
                    <button class="nav-btn" data-tab="monitor">
                        <i class="fas fa-desktop"></i>
                        Network Monitor
                    </button>
                    <button class="nav-btn" data-tab="analyzer">
                        <i class="fas fa-brain"></i>
                        Log Analyzer
                    </button>
                    <button class="nav-btn" data-tab="prompts">
                        <i class="fas fa-comments"></i>
                        AI Prompts
                    </button>
                    <button class="nav-btn" data-tab="settings">
                        <i class="fas fa-cog"></i>
                        Settings
                    </button>
                </nav>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Dashboard Tab -->
            <div id="dashboard" class="tab-content active">
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-wifi"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Active Devices</h3>
                            <div class="stat-value" id="activeDevices">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Alerts</h3>
                            <div class="stat-value" id="alertCount">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-upload"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Data Transfer</h3>
                            <div class="stat-value" id="dataTransfer">0 MB</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Analysis Reports</h3>
                            <div class="stat-value" id="reportCount">0</div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-sections">
                    <section class="recent-alerts">
                        <h2>Recent Alerts</h2>
                        <div id="recentAlerts" class="alerts-container">
                            <!-- Alerts will be populated here -->
                        </div>
                    </section>

                    <section class="network-overview">
                        <h2>Network Overview</h2>
                        <div id="networkChart" class="chart-container">
                            <!-- Network traffic chart will be here -->
                        </div>
                    </section>
                </div>
            </div>

            <!-- Network Monitor Tab -->
            <div id="monitor" class="tab-content">
                <div class="monitor-header">
                    <h2>Real-time Network Monitoring</h2>
                    <div class="monitor-controls">
                        <button id="startMonitoring" class="btn btn-primary">
                            <i class="fas fa-play"></i>
                            Start Monitoring
                        </button>
                        <button id="stopMonitoring" class="btn btn-secondary" disabled>
                            <i class="fas fa-stop"></i>
                            Stop Monitoring
                        </button>
                        <button id="refreshDevices" class="btn btn-info">
                            <i class="fas fa-sync"></i>
                            Refresh
                        </button>
                    </div>
                </div>

                <div class="monitor-grid">
                    <div class="devices-panel">
                        <h3>Connected Devices</h3>
                        <div id="devicesList" class="devices-list">
                            <!-- Devices will be populated here -->
                        </div>
                    </div>

                    <div class="traffic-panel">
                        <h3>Live Traffic Data</h3>
                        <div id="trafficData" class="traffic-data">
                            <!-- Real-time traffic data -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Log Analyzer Tab -->
            <div id="analyzer" class="tab-content">
                <div class="analyzer-header">
                    <h2>Log Analysis</h2>
                </div>

                <div class="upload-section">
                    <div class="upload-area" id="uploadArea">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drop Wireshark logs here or click to browse</p>
                        <small>Supports: .pcap, .pcapng, .cap, .txt, .log</small>
                        <input type="file" id="logFileInput" accept=".pcap,.pcapng,.cap,.txt,.log" multiple hidden>
                    </div>
                </div>

                <div class="uploaded-files">
                    <h3>Uploaded Files</h3>
                    <div id="uploadedFilesList" class="files-list">
                        <!-- Uploaded files will be listed here -->
                    </div>
                </div>

                <div class="analysis-results">
                    <h3>Analysis Results</h3>
                    <div id="analysisResults" class="results-container">
                        <!-- Analysis results will be displayed here -->
                    </div>
                </div>
            </div>

            <!-- AI Prompts Tab -->
            <div id="prompts" class="tab-content">
                <div class="prompts-header">
                    <h2>AI Model Prompts</h2>
                    <button id="clearPrompts" class="btn btn-danger">
                        <i class="fas fa-trash"></i>
                        Clear All Prompts
                    </button>
                </div>

                <div class="prompt-interface">
                    <div class="model-selection">
                        <label>
                            <input type="radio" name="model" value="granite_3_3" checked>
                            IBM Granite 3.3 Instruct (Primary Reasoning)
                        </label>
                        <label>
                            <input type="radio" name="model" value="granite_4_0">
                            IBM Granite 4.0 Tiny (Long-Context Analysis)
                        </label>
                    </div>

                    <div class="prompt-input">
                        <textarea id="promptText" placeholder="Enter your prompt for AI analysis..."></textarea>
                        <button id="sendPrompt" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i>
                            Send Prompt
                        </button>
                    </div>
                </div>

                <div class="prompt-history">
                    <h3>Prompt History</h3>
                    <div id="promptHistory" class="history-container">
                        <!-- Prompt history will be displayed here -->
                    </div>
                </div>
            </div>

            <!-- Settings Tab -->
            <div id="settings" class="tab-content">
                <div class="settings-header">
                    <h2>System Settings</h2>
                </div>

                <div class="settings-sections">
                    <section class="api-settings">
                        <h3>API Configuration</h3>
                        <div class="api-form">
                            <div class="form-group">
                                <label for="granite33Key">IBM Granite 3.3 Instruct API Key</label>
                                <input type="password" id="granite33Key" placeholder="Enter API key...">
                            </div>
                            <div class="form-group">
                                <label for="granite40Key">IBM Granite 4.0 Tiny API Key</label>
                                <input type="password" id="granite40Key" placeholder="Enter API key...">
                            </div>
                            <button id="saveApiKeys" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                Save API Keys
                            </button>
                        </div>
                    </section>

                    <section class="monitoring-settings">
                        <h3>Monitoring Configuration</h3>
                        <div class="form-group">
                            <label for="monitoringInterval">Data Collection Interval (seconds)</label>
                            <input type="number" id="monitoringInterval" value="5" min="1" max="60">
                        </div>
                        <div class="form-group">
                            <label for="alertThreshold">Alert Threshold (MB/s)</label>
                            <input type="number" id="alertThreshold" value="100" min="1">
                        </div>
                    </section>
                </div>
            </div>
        </main>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay hidden">
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Processing...</p>
        </div>
    </div>

    <!-- Scripts -->
    <script src="js/api.js"></script>
    <script src="js/network-monitor.js"></script>
    <script src="js/log-analyzer.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
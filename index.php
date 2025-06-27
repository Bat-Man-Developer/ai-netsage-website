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
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <i class="fas fa-network-wired"></i>
                <span>AI NetSage</span>
            </div>
            <ul class="nav-menu">
                <li><a href="#dashboard" class="nav-link active">Dashboard</a></li>
                <li><a href="#analysis" class="nav-link">Analysis</a></li>
                <li><a href="#logs" class="nav-link">Logs</a></li>
                <li><a href="#settings" class="nav-link">Settings</a></li>
            </ul>
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Dashboard Section -->
        <section id="dashboard" class="section active">
            <div class="container">
                <header class="section-header">
                    <h1>Network Intelligence Dashboard</h1>
                    <p>Real-time network analysis powered by IBM Granite AI models</p>
                </header>

                <!-- Status Cards -->
                <div class="status-grid">
                    <div class="status-card">
                        <div class="status-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="status-info">
                            <h3>Security Status</h3>
                            <span class="status-value" id="security-status">Monitoring...</span>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="status-info">
                            <h3>Traffic Analysis</h3>
                            <span class="status-value" id="traffic-status">Processing...</span>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="status-info">
                            <h3>Anomalies</h3>
                            <span class="status-value" id="anomaly-count">0</span>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="status-info">
                            <h3>Last Update</h3>
                            <span class="status-value" id="last-update">--</span>
                        </div>
                    </div>
                </div>

                <!-- AI Models Status -->
                <div class="models-section">
                    <h2>AI Analysis Engines</h2>
                    <div class="models-grid">
                        <div class="model-card">
                            <div class="model-header">
                                <h3>IBM Granite 3.3 Instruct</h3>
                                <span class="model-status active" id="granite33-status">Active</span>
                            </div>
                            <p>Primary reasoning engine for real-time log analysis and anomaly detection</p>
                            <div class="model-metrics">
                                <span>Processed: <span id="granite33-processed">0</span> logs</span>
                            </div>
                        </div>
                        <div class="model-card">
                            <div class="model-header">
                                <h3>IBM Granite 4.0 Tiny</h3>
                                <span class="model-status active" id="granite40-status">Active</span>
                            </div>
                            <p>Long-context pattern analysis for historical trend detection</p>
                            <div class="model-metrics">
                                <span>Analyzed: <span id="granite40-analyzed">0</span> patterns</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Real-time Insights -->
                <div class="insights-section">
                    <h2>Real-time Insights</h2>
                    <div class="insights-container" id="insights-container">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Analyzing network data...</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Analysis Section -->
        <section id="analysis" class="section">
            <div class="container">
                <header class="section-header">
                    <h1>Network Analysis</h1>
                    <p>Deep dive into network patterns and anomalies</p>
                </header>

                <div class="analysis-controls">
                    <button class="btn btn-primary" id="run-analysis">
                        <i class="fas fa-play"></i>
                        Run Analysis
                    </button>
                    <select id="analysis-timeframe" class="form-select">
                        <option value="1h">Last Hour</option>
                        <option value="24h" selected>Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>

                <div class="analysis-results" id="analysis-results">
                    <!-- Analysis results will be populated here -->
                </div>
            </div>
        </section>

        <!-- Logs Section -->
        <section id="logs" class="section">
            <div class="container">
                <header class="section-header">
                    <h1>Network Logs</h1>
                    <p>Raw network data and processed insights</p>
                </header>

                <div class="logs-controls">
                    <input type="text" id="log-search" placeholder="Search logs..." class="form-input">
                    <button class="btn btn-secondary" id="refresh-logs">
                        <i class="fas fa-refresh"></i>
                        Refresh
                    </button>
                </div>

                <div class="logs-container" id="logs-container">
                    <!-- Logs will be populated here -->
                </div>
            </div>
        </section>

        <!-- Settings Section -->
        <section id="settings" class="section">
            <div class="container">
                <header class="section-header">
                    <h1>Settings</h1>
                    <p>Configure AI NetSage parameters</p>
                </header>

                <div class="settings-grid">
                    <div class="settings-card">
                        <h3>Analysis Settings</h3>
                        <div class="form-group">
                            <label>Analysis Frequency</label>
                            <select id="analysis-frequency" class="form-select">
                                <option value="real-time">Real-time</option>
                                <option value="5min">Every 5 minutes</option>
                                <option value="15min">Every 15 minutes</option>
                                <option value="1h">Every hour</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Anomaly Threshold</label>
                            <input type="range" id="anomaly-threshold" min="1" max="10" value="5" class="form-range">
                            <span id="threshold-value">5</span>
                        </div>
                    </div>

                    <div class="settings-card">
                        <h3>Model Configuration</h3>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="granite33-enabled" checked>
                                Enable Granite 3.3 Instruct
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="granite40-enabled" checked>
                                Enable Granite 4.0 Tiny
                            </label>
                        </div>
                    </div>
                </div>

                <button class="btn btn-primary" id="save-settings">
                    <i class="fas fa-save"></i>
                    Save Settings
                </button>
            </div>
        </section>
    </main>

    <!-- Notification System -->
    <div id="notification-container" class="notification-container"></div>

    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay">
        <div class="loading-content">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Processing...</span>
        </div>
    </div>

    <!-- Scripts -->
    <script src="js/utils.js"></script>
    <script src="js/api.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/analysis.js"></script>
    <script src="js/logs.js"></script>
    <script src="js/settings.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
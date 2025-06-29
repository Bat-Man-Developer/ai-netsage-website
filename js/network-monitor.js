/**
 * Real-time Network Monitor with AI Analysis
 */

let monitoringActive = false;
let networkMonitorInterval = null;
let networkDataBuffer = [];
let anomalyCheckInterval = null;
let alertsBuffer = [];

function initializeNetworkMonitor() {
    const startBtn = document.getElementById('start-monitoring');
    const stopBtn = document.getElementById('stop-monitoring');
    const pauseBtn = document.getElementById('pause-monitoring');
    
    if (startBtn) {
        startBtn.addEventListener('click', startMonitoring);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopMonitoring);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseMonitoring);
    }

    // Add alerts container to the monitor section
    createAlertsContainer();
    createNetworkDataTable();
}

function createAlertsContainer() {
    const monitorSection = document.getElementById('monitor');
    const existingAlertsContainer = document.getElementById('alerts-container');
    
    if (!existingAlertsContainer) {
        const alertsContainer = document.createElement('div');
        alertsContainer.id = 'alerts-container';
        alertsContainer.className = 'alerts-container';
        alertsContainer.innerHTML = `
            <h3><i class="fas fa-exclamation-triangle"></i> AI Security Alerts</h3>
            <div id="alerts-list" class="alerts-list">
                <p class="no-alerts">No security alerts detected</p>
            </div>
        `;
        
        const networkDataSection = monitorSection.querySelector('.network-data');
        networkDataSection.parentNode.insertBefore(alertsContainer, networkDataSection);
    }
}

function createNetworkDataTable() {
    const networkLog = document.getElementById('network-log');
    networkLog.innerHTML = `
        <div class="network-data-header">
            <h4>Live Network Traffic Analysis</h4>
            <div class="data-stats">
                <span id="packets-count">Packets: 0</span>
                <span id="connections-count">Connections: 0</span>
                <span id="protocols-count">Protocols: 0</span>
            </div>
        </div>
        <div class="network-table-container">
            <table class="network-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Source IP</th>
                        <th>Destination IP</th>
                        <th>Protocol</th>
                        <th>Ports</th>
                        <th>Size</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="network-table-body">
                    <tr>
                        <td colspan="7" class="no-data">Start monitoring to see real-time network data</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

async function startMonitoring() {
    try {
        monitoringActive = true;
        updateMonitoringUI();
        
        // Clear previous data
        networkDataBuffer = [];
        alertsBuffer = [];
        updateNetworkDisplay();
        
        // Start the monitoring loop - capture every 3 seconds
        networkMonitorInterval = setInterval(fetchNetworkData, 3000);
        
        // Start AI anomaly detection - analyze every 15 seconds
        anomalyCheckInterval = setInterval(performAnomalyDetection, 15000);
        
        window.AppUtils.showNotification('Real-time network monitoring started with AI analysis', 'success');
        
    } catch (error) {
        console.error('Error starting monitoring:', error);
        window.AppUtils.showNotification('Error starting monitoring: ' + error.message, 'error');
        stopMonitoring();
    }
}

async function fetchNetworkData() {
    if (!monitoringActive) return;
    
    try {
        const response = await fetch('../call_python/network_monitor/getNetworkData.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'capture',
                duration: 3
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            processNetworkData(result.data);
        } else {
            console.error('Network data fetch error:', result.error);
            displayNetworkError(result.error || 'Unknown error fetching network data');
        }
        
    } catch (error) {
        console.error('Error fetching network data:', error);
        if (monitoringActive) {
            displayNetworkError(error.message);
        }
    }
}

function processNetworkData(data) {
    const timestamp = new Date().toLocaleString();
    
    // Process each packet
    if (Array.isArray(data) && data.length > 0) {
        data.forEach(packet => {
            // Add enhanced packet information
            const enhancedPacket = {
                ...packet,
                timestamp: packet.timestamp || timestamp,
                id: Date.now() + Math.random(),
                risk_level: assessPacketRisk(packet)
            };
            
            networkDataBuffer.push(enhancedPacket);
        });
        
        // Keep only last 500 packets in memory
        if (networkDataBuffer.length > 500) {
            networkDataBuffer = networkDataBuffer.slice(-500);
        }
        
        // Update display
        updateNetworkDisplay();
        updateNetworkStats();
        
        // Store in localStorage
        localStorage.setItem('network-data', JSON.stringify(networkDataBuffer.slice(-100)));
        localStorage.setItem('last-analysis', timestamp);
        
    } else {
        // Still update timestamp even if no packets
        localStorage.setItem('last-analysis', timestamp);
    }
}

function assessPacketRisk(packet) {
    let riskScore = 0;
    let riskFactors = [];
    
    // Check for suspicious IPs (basic heuristics)
    if (packet.source_ip && (
        packet.source_ip.startsWith('10.') ||
        packet.source_ip.startsWith('192.168.') ||
        packet.source_ip.startsWith('172.')
    )) {
        // Internal traffic - lower risk
        riskScore += 1;
    } else {
        // External traffic - higher scrutiny
        riskScore += 2;
    }
    
    // Check for suspicious ports
    const suspiciousPorts = ['22', '23', '135', '139', '445', '3389', '5900'];
    if (packet.source_port && suspiciousPorts.includes(String(packet.source_port))) {
        riskScore += 3;
        riskFactors.push('Suspicious source port');
    }
    if (packet.destination_port && suspiciousPorts.includes(String(packet.destination_port))) {
        riskScore += 3;
        riskFactors.push('Suspicious destination port');
    }
    
    // Check packet size
    if (packet.packet_length && parseInt(packet.packet_length) > 1500) {
        riskScore += 2;
        riskFactors.push('Large packet size');
    }
    
    // Determine risk level
    let level = 'low';
    if (riskScore >= 7) {
        level = 'high';
    } else if (riskScore >= 4) {
        level = 'medium';
    }
    
    return {
        score: riskScore,
        level: level,
        factors: riskFactors
    };
}

function updateNetworkDisplay() {
    const tableBody = document.getElementById('network-table-body');
    
    if (!tableBody) return;
    
    if (networkDataBuffer.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No network data captured yet</td></tr>';
        return;
    }
    
    // Show last 20 packets
    const recentPackets = networkDataBuffer.slice(-20);
    
    tableBody.innerHTML = recentPackets.map(packet => {
        const riskClass = packet.risk_level ? `risk-${packet.risk_level.level}` : 'risk-low';
        const ports = `${packet.source_port || 'N/A'}:${packet.destination_port || 'N/A'}`;
        const size = packet.packet_length ? `${packet.packet_length} bytes` : 'N/A';
        const status = packet.risk_level ? packet.risk_level.level.toUpperCase() : 'NORMAL';
        
        return `
            <tr class="${riskClass}">
                <td>${new Date(packet.timestamp).toLocaleTimeString()}</td>
                <td>${packet.source_ip || 'N/A'}</td>
                <td>${packet.destination_ip || 'N/A'}</td>
                <td>${packet.protocol || 'N/A'}</td>
                <td>${ports}</td>
                <td>${size}</td>
                <td><span class="status-badge status-${packet.risk_level?.level || 'low'}">${status}</span></td>
            </tr>
        `;
    }).join('');
}

function updateNetworkStats() {
    const packetsCount = document.getElementById('packets-count');
    const connectionsCount = document.getElementById('connections-count');
    const protocolsCount = document.getElementById('protocols-count');
    
    if (packetsCount) {
        packetsCount.textContent = `Packets: ${networkDataBuffer.length}`;
    }
    
    // Count unique connections
    const uniqueConnections = new Set();
    const uniqueProtocols = new Set();
    
    networkDataBuffer.forEach(packet => {
        if (packet.source_ip && packet.destination_ip) {
            uniqueConnections.add(`${packet.source_ip}-${packet.destination_ip}`);
        }
        if (packet.protocol) {
            uniqueProtocols.add(packet.protocol);
        }
    });
    
    if (connectionsCount) {
        connectionsCount.textContent = `Connections: ${uniqueConnections.size}`;
    }
    
    if (protocolsCount) {
        protocolsCount.textContent = `Protocols: ${uniqueProtocols.size}`;
    }
    
    // Update dashboard stats
    localStorage.setItem('active-connections', uniqueConnections.size.toString());
    window.AppUtils.updateDashboardStats();
}

async function performAnomalyDetection() {
    if (!monitoringActive || networkDataBuffer.length === 0) return;
    
    try {
        // Prepare network data summary for AI analysis
        const recentData = networkDataBuffer.slice(-50); // Last 50 packets
        const networkSummary = generateNetworkSummary(recentData);
        
        const anomalyPrompt = `You are an AI Network Security Analyst using IBM Granite 3.3B model for real-time network monitoring. Analyze the following network traffic data and detect any security anomalies, threats, or suspicious patterns:

NETWORK TRAFFIC SUMMARY:
${networkSummary}

Please analyze this data and provide:
1. SECURITY STATUS: Normal/Warning/Critical
2. ANOMALIES DETECTED: List any suspicious patterns
3. THREAT ASSESSMENT: Assess potential security threats
4. RECOMMENDED ACTIONS: Immediate actions to take
5. RISK SCORE: Rate from 1-10 (10 being highest risk)

Focus on detecting:
- Unusual traffic patterns
- Suspicious IP addresses
- Port scanning attempts
- Potential malware communication
- Data exfiltration indicators
- DDoS attack patterns

Provide a concise security assessment.`;

        // Call IBM Granite 3.3B model for analysis
        const response = await fetch('../call_python/ibm_granite_models/getIBMGraniteModels.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_type: 'granite33',
                prompt: anomalyPrompt
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            processAnomalyAnalysis(result.response, recentData);
        } else {
            console.error('Anomaly detection failed:', result.error);
        }
        
    } catch (error) {
        console.error('Error in anomaly detection:', error);
    }
}

function generateNetworkSummary(data) {
    const summary = {
        packet_count: data.length,
        time_window: data.length > 0 ? `${new Date(data[0].timestamp).toLocaleTimeString()} - ${new Date(data[data.length-1].timestamp).toLocaleTimeString()}` : 'No data',
        unique_sources: [...new Set(data.map(p => p.source_ip))].filter(Boolean),
        unique_destinations: [...new Set(data.map(p => p.destination_ip))].filter(Boolean),
        protocols: [...new Set(data.map(p => p.protocol))].filter(Boolean),
        high_risk_packets: data.filter(p => p.risk_level && p.risk_level.level === 'high').length,
        medium_risk_packets: data.filter(p => p.risk_level && p.risk_level.level === 'medium').length,
        suspicious_ports: [...new Set(data.flatMap(p => [p.source_port, p.destination_port]).filter(Boolean))],
        average_packet_size: data.length > 0 ? Math.round(data.reduce((sum, p) => sum + (parseInt(p.packet_length) || 0), 0) / data.length) : 0
    };
    
    return JSON.stringify(summary, null, 2);
}

function processAnomalyAnalysis(analysisResponse, networkData) {
    // Extract key information from AI response
    const lines = analysisResponse.split('\n');
    let securityStatus = 'Normal';
    let riskScore = 1;
    let anomalies = [];
    let recommendations = [];
    
    // Parse AI response for key indicators
    lines.forEach(line => {
        const upperLine = line.toUpperCase();
        if (upperLine.includes('SECURITY STATUS') || upperLine.includes('STATUS:')) {
            if (upperLine.includes('CRITICAL')) securityStatus = 'Critical';
            else if (upperLine.includes('WARNING')) securityStatus = 'Warning';
        }
        
        if (upperLine.includes('RISK SCORE') && line.match(/\d+/)) {
            const score = parseInt(line.match(/\d+/)[0]);
            if (score >= 1 && score <= 10) riskScore = score;
        }
        
        if (upperLine.includes('ANOMALIES') || upperLine.includes('SUSPICIOUS')) {
            anomalies.push(line);
        }
        
        if (upperLine.includes('RECOMMEND')) {
            recommendations.push(line);
        }
    });
    
    // Create alert if significant risk detected
    if (riskScore >= 6 || securityStatus !== 'Normal') {
        createSecurityAlert({
            timestamp: new Date().toLocaleString(),
            severity: securityStatus,
            riskScore: riskScore,
            analysis: analysisResponse,
            affectedPackets: networkData.filter(p => p.risk_level && p.risk_level.level !== 'low').length,
            anomalies: anomalies,
            recommendations: recommendations
        });
        
        // Update anomaly count
        const currentAnomalies = parseInt(localStorage.getItem('anomaly-count') || '0');
        localStorage.setItem('anomaly-count', (currentAnomalies + 1).toString());
        window.AppUtils.updateDashboardStats();
    }
}

function createSecurityAlert(alertData) {
    const alertsList = document.getElementById('alerts-list');
    
    // Remove "no alerts" message
    const noAlertsMsg = alertsList.querySelector('.no-alerts');
    if (noAlertsMsg) {
        noAlertsMsg.remove();
    }
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `security-alert alert-${alertData.severity.toLowerCase()}`;
    alertDiv.innerHTML = `
        <div class="alert-header">
            <span class="alert-severity">${alertData.severity.toUpperCase()}</span>
            <span class="alert-time">${alertData.timestamp}</span>
            <span class="alert-risk">Risk: ${alertData.riskScore}/10</span>
        </div>
        <div class="alert-content">
            <strong>AI Analysis:</strong>
            <div class="alert-analysis">${alertData.analysis}</div>
            <div class="alert-details">
                <small>Affected Packets: ${alertData.affectedPackets}</small>
            </div>
        </div>
        <div class="alert-actions">
            <button class="btn-small btn-primary" onclick="showFullAlert('${alertData.timestamp}')">View Details</button>
            <button class="btn-small btn-secondary" onclick="dismissAlert(this)">Dismiss</button>
        </div>
    `;
    
    // Add to alerts buffer and display
    alertsBuffer.push(alertData);
    alertsList.insertBefore(alertDiv, alertsList.firstChild);
    
    // Keep only last 10 alerts visible
    const alerts = alertsList.querySelectorAll('.security-alert');
    if (alerts.length > 10) {
        alerts[alerts.length - 1].remove();
    }
    
    // Show notification
    const severity = alertData.severity.toLowerCase();
    const notificationType = severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : 'info';
    window.AppUtils.showNotification(`Security Alert: ${alertData.severity} risk detected (${alertData.riskScore}/10)`, notificationType);
}

function dismissAlert(button) {
    const alert = button.closest('.security-alert');
    alert.remove();
    
    // Show "no alerts" message if no alerts left
    const alertsList = document.getElementById('alerts-list');
    if (alertsList.children.length === 0) {
        alertsList.innerHTML = '<p class="no-alerts">No security alerts detected</p>';
    }
}

function displayNetworkError(error) {
    const tableBody = document.getElementById('network-table-body');
    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" class="error-message">Error: ${error}</td></tr>`;
    }
}

function stopMonitoring() {
    monitoringActive = false;
    
    if (networkMonitorInterval) {
        clearInterval(networkMonitorInterval);
        networkMonitorInterval = null;
    }
    
    if (anomalyCheckInterval) {
        clearInterval(anomalyCheckInterval);
        anomalyCheckInterval = null;
    }
    
    updateMonitoringUI();
    window.AppUtils.showNotification('Network monitoring and AI analysis stopped', 'info');
}

function pauseMonitoring() {
    if (networkMonitorInterval) {
        clearInterval(networkMonitorInterval);
        networkMonitorInterval = null;
    }
    
    if (anomalyCheckInterval) {
        clearInterval(anomalyCheckInterval);
        anomalyCheckInterval = null;
    }
    
    updateMonitoringUI();
    window.AppUtils.showNotification('Network monitoring paused', 'warning');
}

function updateMonitoringUI() {
    const startBtn = document.getElementById('start-monitoring');
    const stopBtn = document.getElementById('stop-monitoring');
    const pauseBtn = document.getElementById('pause-monitoring');
    const statusIndicator = document.getElementById('monitor-status');
    
    if (monitoringActive) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;
        statusIndicator.className = 'status-indicator connected';
        statusIndicator.querySelector('.status-text').textContent = 'Monitoring Active';
    } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        pauseBtn.disabled = true;
        statusIndicator.className = 'status-indicator';
        statusIndicator.querySelector('.status-text').textContent = 'Disconnected';
    }
}

// Global functions for alert management
window.showFullAlert = function(timestamp) {
    const alert = alertsBuffer.find(a => a.timestamp === timestamp);
    if (alert) {
        const popup = window.open('', 'AlertDetails', 'width=800,height=600,scrollbars=yes');
        popup.document.write(`
            <html>
                <head><title>Security Alert Details</title></head>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Security Alert Details</h2>
                    <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
                    <p><strong>Severity:</strong> ${alert.severity}</p>
                    <p><strong>Risk Score:</strong> ${alert.riskScore}/10</p>
                    <h3>AI Analysis:</h3>
                    <pre style="background: #f5f5f5; padding: 10px; white-space: pre-wrap;">${alert.analysis}</pre>
                </body>
            </html>
        `);
    }
};

window.dismissAlert = dismissAlert;
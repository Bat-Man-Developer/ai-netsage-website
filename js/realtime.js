// Real-time Network Monitoring
class RealtimeMonitor {
    constructor() {
        this.isMonitoring = false;
        this.ws = null;
        this.monitoringInterval = null;
        this.trafficData = {
            inbound: 0,
            outbound: 0,
            connections: new Map(),
            recentTraffic: []
        };
        this.init();
    }

    init() {
        this.setupControls();
        this.setupWebSocket();
    }

    setupControls() {
        const startBtn = document.getElementById('startMonitoring');
        const stopBtn = document.getElementById('stopMonitoring');

        startBtn.addEventListener('click', () => this.startMonitoring());
        stopBtn.addEventListener('click', () => this.stopMonitoring());
    }

    setupWebSocket() {
        // WebSocket connection for real-time data
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/server/realtime-ws.php`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealtimeData(data);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.setupWebSocket(), 5000);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket setup failed:', error);
            // Fallback to polling
            this.setupPolling();
        }
    }

    setupPolling() {
        // Fallback polling method if WebSocket fails
        this.pollingInterval = setInterval(() => {
            if (this.isMonitoring) {
                this.fetchRealtimeData();
            }
        }, 2000);
    }

    async fetchRealtimeData() {
        try {
            const data = await app.apiCall('realtime-data');
            this.handleRealtimeData(data);
        } catch (error) {
            console.error('Error fetching realtime data:', error);
        }
    }

    async startMonitoring() {
        try {
            // Request monitoring permissions
            const permission = await this.requestNetworkPermissions();
            if (!permission) {
                app.showMessage('Network monitoring permissions required', 'error');
                return;
            }

            const result = await app.apiCall('start-monitoring', 'POST');
            
            if (result.success) {
                this.isMonitoring = true;
                this.updateMonitoringStatus('Running', 'online');
                
                document.getElementById('startMonitoring').disabled = true;
                document.getElementById('stopMonitoring').disabled = false;
                
                // Start WebSocket or polling
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ action: 'start_monitoring' }));
                } else {
                    this.startPolling();
                }
                
                dashboard.addActivityItem('Real-time monitoring started');
                app.showMessage('Real-time monitoring started', 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            app.showMessage('Failed to start monitoring: ' + error.message, 'error');
        }
    }

    async stopMonitoring() {
        try {
            const result = await app.apiCall('stop-monitoring', 'POST');
            
            if (result.success) {
                this.isMonitoring = false;
                this.updateMonitoringStatus('Stopped', 'offline');
                
                document.getElementById('startMonitoring').disabled = false;
                document.getElementById('stopMonitoring').disabled = true;
                
                // Stop WebSocket or polling
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ action: 'stop_monitoring' }));
                }
                this.stopPolling();
                
                dashboard.addActivityItem('Real-time monitoring stopped');
                app.showMessage('Real-time monitoring stopped', 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            app.showMessage('Failed to stop monitoring: ' + error.message, 'error');
        }
    }

    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(() => {
            this.fetchRealtimeData();
        }, 1000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    async requestNetworkPermissions() {
        // Check if the app has necessary permissions
        try {
            // For demonstration - in a real implementation, this would
            // interface with network monitoring capabilities
            return true;
        } catch (error) {
            return false;
        }
    }

    handleRealtimeData(data) {
        if (data.type === 'traffic') {
            this.updateTrafficStats(data);
        } else if (data.type === 'connection') {
            this.updateConnections(data);
        } else if (data.type === 'anomaly') {
            this.handleAnomalyDetection(data);
        }
    }

    updateTrafficStats(data) {
        if (data.direction === 'inbound') {
            this.trafficData.inbound += data.size;
        } else if (data.direction === 'outbound') {
            this.trafficData.outbound += data.size;
        }

        // Update UI
        document.getElementById('inboundTraffic').textContent = app.formatBytes(this.trafficData.inbound);
        document.getElementById('outboundTraffic').textContent = app.formatBytes(this.trafficData.outbound);

        // Add to traffic log
        this.addTrafficLogEntry(data);

        // Store recent traffic for analysis
        this.trafficData.recentTraffic.push({
            ...data,
            timestamp: new Date()
        });

        // Keep only last 1000 entries
        if (this.trafficData.recentTraffic.length > 1000) {
            this.trafficData.recentTraffic = this.trafficData.recentTraffic.slice(-1000);
        }
    }

    updateConnections(data) {
        const connectionKey = `${data.source_ip}:${data.port}`;
        
        this.trafficData.connections.set(connectionKey, {
            source: data.source_ip,
            destination: data.destination_ip,
            port: data.port,
            protocol: data.protocol,
            lastSeen: new Date(),
            packets: (this.trafficData.connections.get(connectionKey)?.packets || 0) + 1
        });

        this.updateConnectionsList();
    }

    updateConnectionsList() {
        const connectionsList = document.getElementById('connectionsList');
        const connections = Array.from(this.trafficData.connections.values());
        
        // Sort by last seen (most recent first)
        connections.sort((a, b) => b.lastSeen - a.lastSeen);
        
        connectionsList.innerHTML = connections.slice(0, 20).map(conn => `
            <div class="connection-item">
                ${conn.source} → ${conn.destination}:${conn.port} (${conn.protocol})
                <span class="connection-packets">${conn.packets} packets</span>
            </div>
        `).join('');
    }

    addTrafficLogEntry(data) {
        const trafficLog = document.getElementById('trafficLog');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'traffic-item';
        logEntry.innerHTML = `
            <span class="traffic-time">${timestamp}</span>
            <span class="traffic-direction ${data.direction}">${data.direction.toUpperCase()}</span>
            <span class="traffic-size">${app.formatBytes(data.size)}</span>
            <span class="traffic-source">${data.source_ip}:${data.port}</span>
            <span class="traffic-protocol">${data.protocol}</span>
        `;
        
        trafficLog.insertBefore(logEntry, trafficLog.firstChild);
        
        // Keep only last 50 entries
        const entries = trafficLog.querySelectorAll('.traffic-item');
        if (entries.length > 50) {
            trafficLog.removeChild(entries[entries.length - 1]);
        }
    }

    handleAnomalyDetection(data) {
        dashboard.updateAnomalyCount(data.severity, 
            (dashboard.stats.anomalies[data.severity] || 0) + 1);
        
        dashboard.addActivityItem(`Anomaly detected: ${data.description}`);
        dashboard.addRecommendation('Real-time', data.recommendation);
        
        // Show notification for high/critical anomalies
        if (data.severity === 'high' || data.severity === 'critical') {
            app.showMessage(`${data.severity.toUpperCase()} anomaly detected: ${data.description}`, 'error');
        }
    }

    updateMonitoringStatus(status, statusClass) {
        const statusElement = document.getElementById('monitorStatus');
        statusElement.textContent = status;
        statusElement.className = `status-indicator ${statusClass}`;
    }

    initialize() {
        // Called when real-time section is activated
        if (this.isMonitoring) {
            this.updateMonitoringStatus('Running', 'online');
            document.getElementById('startMonitoring').disabled = true;
            document.getElementById('stopMonitoring').disabled = false;
        } else {
            this.updateMonitoringStatus('Stopped', 'offline');
            document.getElementById('startMonitoring').disabled = false;
            document.getElementById('stopMonitoring').disabled = true;
        }
    }

    cleanup() {
        // Cleanup when component is destroyed
        this.stopMonitoring();
        if (this.ws) {
            this.ws.close();
        }
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }
}

// Initialize real-time monitor
const realtime = new RealtimeMonitor();

// Add real-time specific styles
const realtimeStyles = `
<style>
.traffic-item {
    display: grid;
    grid-template-columns: auto auto auto 1fr auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.875rem;
}

.traffic-time {
    color: var(--text-secondary);
    font-family: monospace;
}

.traffic-direction {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.traffic-direction.inbound {
    background: rgb(5 150 105 / 0.2);
    color: var(--success-color);
}

.traffic-direction.outbound {
    background: rgb(37 99 235 / 0.2);
    color: var(--primary-color);
}

.traffic-size {
    font-family: monospace;
    color: var(--text-primary);
}

.traffic-source {
    font-family: monospace;
    color: var(--text-secondary);
}

.traffic-protocol {
    font-family: monospace;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.connection-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
    font-family: monospace;
    font-size: 0.875rem;
}

.connection-packets {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.status-indicator.online::before {
    content: '●';
    color: var(--success-color);
    margin-right: 0.5rem;
}

.status-indicator.offline::before {
    content: '●';
    color: var(--error-color);
    margin-right: 0.5rem;
}

@media (max-width: 768px) {
    .traffic-item {
        grid-template-columns: 1fr;
        gap: 0.25rem;
    }
    
    .connection-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', realtimeStyles);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    realtime.cleanup();
});
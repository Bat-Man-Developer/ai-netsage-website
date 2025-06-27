// Network monitoring functionality
class NetworkMonitor {
    constructor() {
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.selectedDevice = null;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startMonitoring');
        this.stopBtn = document.getElementById('stopMonitoring');
        this.refreshBtn = document.getElementById('refreshDevices');
        this.devicesList = document.getElementById('devicesList');
        this.trafficData = document.getElementById('trafficData');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startMonitoring());
        this.stopBtn.addEventListener('click', () => this.stopMonitoring());
        this.refreshBtn.addEventListener('click', () => this.refreshDevices());
    }

    async startMonitoring() {
        try {
            await api.startMonitoring();
            this.isMonitoring = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            // Start polling for data
            this.monitoringInterval = setInterval(() => {
                this.updateTrafficData();
            }, 2000);
            
            this.addTrafficEntry('Monitoring started...', 'system');
        } catch (error) {
            console.error('Failed to start monitoring:', error);
            alert('Failed to start monitoring: ' + error.message);
        }
    }

    async stopMonitoring() {
        try {
            await api.stopMonitoring();
            this.isMonitoring = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            
            this.addTrafficEntry('Monitoring stopped.', 'system');
        } catch (error) {
            console.error('Failed to stop monitoring:', error);
            alert('Failed to stop monitoring: ' + error.message);
        }
    }

    async refreshDevices() {
        try {
            const devices = await api.getNetworkDevices();
            this.renderDevices(devices);
        } catch (error) {
            console.error('Failed to refresh devices:', error);
        }
    }

    renderDevices(devices) {
        this.devicesList.innerHTML = '';
        
        if (devices.length === 0) {
            this.devicesList.innerHTML = '<p class="text-gray-500">No devices found</p>';
            return;
        }

        devices.forEach(device => {
            const deviceElement = document.createElement('div');
            deviceElement.className = 'device-item';
            deviceElement.onclick = () => this.selectDevice(device.id, deviceElement);
            
            deviceElement.innerHTML = `
                <div class="device-status ${device.status}"></div>
                <div class="device-info">
                    <h4>${device.device_name || 'Unknown Device'}</h4>
                    <p>${device.ip_address} • ${device.mac_address}</p>
                    <small>${device.device_type || 'Unknown Type'}</small>
                </div>
            `;
            
            this.devicesList.appendChild(deviceElement);
        });
    }

    selectDevice(deviceId, element) {
        // Remove active class from all devices
        document.querySelectorAll('.device-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected device
        element.classList.add('active');
        this.selectedDevice = deviceId;
        
        // Clear current traffic data
        this.trafficData.innerHTML = '';
        this.addTrafficEntry(`Monitoring device ID: ${deviceId}`, 'system');
    }

    async updateTrafficData() {
        if (!this.isMonitoring) return;
        
        try {
            const trafficData = await api.getTrafficData(this.selectedDevice);
            
            trafficData.forEach(entry => {
                const direction = entry.direction || 'unknown';
                const message = `${entry.timestamp} | ${entry.protocol} | ${entry.source_ip}:${entry.source_port} → ${entry.destination_ip}:${entry.destination_port} | ${entry.bytes_sent || 0}B`;
                this.addTrafficEntry(message, direction);
            });
        } catch (error) {
            console.error('Failed to update traffic data:', error);
        }
    }

    addTrafficEntry(message, type) {
        const entry = document.createElement('div');
        entry.className = `traffic-entry ${type}`;
        entry.textContent = message;
        
        this.trafficData.appendChild(entry);
        this.trafficData.scrollTop = this.trafficData.scrollHeight;
        
        // Keep only last 100 entries
        while (this.trafficData.children.length > 100) {
            this.trafficData.removeChild(this.trafficData.firstChild);
        }
    }

    async initialize() {
        await this.refreshDevices();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.networkMonitor = new NetworkMonitor();
});
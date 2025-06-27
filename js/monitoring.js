// Network Monitoring Module
class NetworkMonitor {
    constructor() {
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.trafficChart = null;
        this.devices = [];
        this.trafficData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeChart();
        this.loadDevices();
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-monitoring');
        const stopBtn = document.getElementById('stop-monitoring');
        const refreshBtn = document.getElementById('refresh-devices');
        const clearLogsBtn = document.getElementById('clear-logs');
        const deviceFilter = document.getElementById('device-filter');
        const protocolFilter = document.getElementById('protocol-filter');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startMonitoring());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopMonitoring());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDevices());
        }

        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => this.clearTrafficLogs());
        }

        if (deviceFilter) {
            deviceFilter.addEventListener('change', () => this.filterTrafficLogs());
        }

        if (protocolFilter) {
            protocolFilter.addEventListener('change', () => this.filterTrafficLogs());
        }
    }

    initializeChart() {
        const canvas = document.getElementById('traffic-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Simple traffic visualization (replace with actual charting library in production)
        this.trafficChart = {
            canvas: canvas,
            ctx: ctx,
            data: [],
            maxPoints: 50
        };

        this.drawChart();
    }

    drawChart() {
        if (!this.trafficChart) return;

        const { canvas, ctx, data } = this.trafficChart;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw traffic data
        if (data.length > 1) {
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const maxValue = Math.max(...data, 1);
            const stepX = width / (data.length - 1);

            data.forEach((value, index) => {
                const x = index * stepX;
                const y = height - (value / maxValue) * height;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        }

        // Draw labels
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('Traffic (MB/s)', 10, 20);
        ctx.fillText('Time', width - 40, height - 10);
    }

    async startMonitoring() {
        if (this.isMonitoring) return;

        try {
            const response = await window.netSageApp.makeApiCall('POST', 'start-monitoring');
            if (response.success) {
                this.isMonitoring = true;
                this.updateMonitoringUI();
                this.startTrafficUpdates();
                window.netSageApp.showSuccess('Network monitoring started');
            }
        } catch (error) {
            console.error('Failed to start monitoring:', error);
            window.netSageApp.showError('Failed to start network monitoring');
        }
    }

    async stopMonitoring() {
        if (!this.isMonitoring) return;

        try {
            const response = await window.netSageApp.makeApiCall('POST', 'stop-monitoring');
            if (response.success) {
                this.isMonitoring = false;
                this.updateMonitoringUI();
                this.stopTrafficUpdates();
                window.netSageApp.showSuccess('Network monitoring stopped');
            }
        } catch (error) {
            console.error('Failed to stop monitoring:', error);
            window.netSageApp.showError('Failed to stop network monitoring');
        }
    }

    updateMonitoringUI() {
        const startBtn = document.getElementById('start-monitoring');
        const stopBtn = document.getElementById('stop-monitoring');
        const statusEl = document.getElementById('monitoring-status');

        if (startBtn) startBtn.disabled = this.isMonitoring;
        if (stopBtn) stopBtn.disabled = !this.isMonitoring;
        if (statusEl) statusEl.textContent = this.isMonitoring ? 'Active' : 'Stopped';
    }

    startTrafficUpdates() {
        this.monitoringInterval = setInterval(() => {
            this.updateTrafficData();
            this.loadTrafficLogs();
        }, 5000); // Update every 5 seconds
    }

    stopTrafficUpdates() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    updateTrafficData() {
        // Simulate real-time traffic data
        const newValue = Math.random() * 10; // Random traffic value
        
        if (this.trafficChart.data.length >= this.trafficChart.maxPoints) {
            this.trafficChart.data.shift();
        }
        
        this.trafficChart.data.push(newValue);
        this.drawChart();

        // Update traffic metric
        const trafficEl = document.getElementById('network-traffic');
        if (trafficEl) {
            trafficEl.textContent = `${newValue.toFixed(1)} MB/s`;
        }
    }

    async loadDevices() {
        try {
            const devices = await window.netSageApp.makeApiCall('GET', 'devices');
            this.devices = devices;
            this.displayDevices(devices);
            this.updateDeviceFilter(devices);
        } catch (error) {
            console.error('Failed to load devices:', error);
        }
    }

    displayDevices(devices) {
        const container = document.getElementById('device-list');
        if (!container) return;

        if (devices.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No devices detected</p>';
            return;
        }

        container.innerHTML = devices.map(device => `
            <div class="device-item">
                <div class="device-info">
                    <h4>${device.device_name || 'Unknown Device'}</h4>
                    <p>IP: ${device.ip_address} | MAC: ${device.mac_address}</p>
                    <p>Type: ${device.device_type || 'Unknown'} | Last seen: ${window.netSageApp.formatDateTime(device.last_seen)}</p>
                </div>
                <div class="device-status ${device.is_active ? 'active' : 'inactive'}">
                    ${device.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>
        `).join('');

        // Update active devices count
        const activeCount = devices.filter(d => d.is_active).length;
        const activeDevicesEl = document.getElementById('active-devices');
        if (activeDevicesEl) {
            activeDevicesEl.textContent = activeCount;
        }
    }

    updateDeviceFilter(devices) {
        const select = document.getElementById('device-filter');
        if (!select) return;

        // Clear existing options except "All Devices"
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // Add device options
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.device_name || device.ip_address;
            select.appendChild(option);
        });
    }

    async loadTrafficLogs() {
        try {
            const deviceId = document.getElementById('device-filter')?.value || '';
            const protocol = document.getElementById('protocol-filter')?.value || '';
            
            const queryParams = new URLSearchParams({
                limit: 100,
                ...(deviceId && { device_id: deviceId }),
                ...(protocol && { protocol: protocol })
            });

            const traffic = await window.netSageApp.makeApiCall('GET', `traffic?${queryParams}`);
            this.displayTrafficLogs(traffic);
        } catch (error) {
            console.error('Failed to load traffic logs:', error);
        }
    }

    displayTrafficLogs(traffic) {
        const tbody = document.getElementById('traffic-logs');
        if (!tbody) return;

        if (traffic.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No traffic logs available</td></tr>';
            return;
        }

        tbody.innerHTML = traffic.map(log => `
            <tr>
                <td>${window.netSageApp.formatDateTime(log.timestamp)}</td>
                <td>${log.device_name || 'Unknown'}</td>
                <td>${log.source_ip}</td>
                <td>${log.destination_ip}</td>
                <td>${log.protocol}</td>
                <td>${log.source_port}:${log.destination_port}</td>
                <td>${log.packet_size} bytes</td>
                <td>
                    <span class="traffic-direction ${log.traffic_type}">
                        ${log.traffic_type === 'incoming' ? '⬇️' : '⬆️'} ${log.traffic_type}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    filterTrafficLogs() {
        this.loadTrafficLogs();
    }

    clearTrafficLogs() {
        const tbody = document.getElementById('traffic-logs');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Traffic logs cleared</td></tr>';
        }

        // Clear chart data
        if (this.trafficChart) {
            this.trafficChart.data = [];
            this.drawChart();
        }
    }

    // Simulate network device discovery
    async simulateDeviceDiscovery() {
        const simulatedDevices = [
            {
                id: 1,
                device_name: 'iPhone 12',
                mac_address: '00:1B:44:11:3A:B7',
                ip_address: '192.168.1.101',
                device_type: 'Mobile',
                is_active: true,
                last_seen: new Date().toISOString()
            },
            {
                id: 2,
                device_name: 'Dell Laptop',
                mac_address: '00:1B:44:11:3A:B8',
                ip_address: '192.168.1.102',
                device_type: 'Computer',
                is_active: true,
                last_seen: new Date().toISOString()
            },
            {
                id: 3,
                device_name: 'Smart TV',
                mac_address: '00:1B:44:11:3A:B9',
                ip_address: '192.168.1.103',
                device_type: 'Media Device',
                is_active: false,
                last_seen: new Date(Date.now() - 3600000).toISOString()
            }
        ];

        return simulatedDevices;
    }
}

// Initialize network monitor
window.networkMonitor = new NetworkMonitor();

// Add CSS for traffic monitoring components
const monitoringStyles = `
    .traffic-direction.incoming {
        color: var(--success-color);
    }
    
    .traffic-direction.outgoing {
        color: var(--primary-color);
    }
    
    .device-item:hover {
        background-color: rgba(37, 99, 235, 0.05);
        cursor: pointer;
    }
    
    .log-table tbody tr:nth-child(even) {
        background-color: rgba(248, 250, 252, 0.5);
    }
    
    .log-table tbody tr:hover {
        background-color: rgba(37, 99, 235, 0.1);
    }
`;

const monitoringStyleSheet = document.createElement('style');
monitoringStyleSheet.textContent = monitoringStyles;
document.head.appendChild(monitoringStyleSheet);
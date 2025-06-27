<?php
class NetworkMonitor {
    private $db;

    public function __construct() {
        $this->db = new Database();
    }

    public function getNetworkDevices() {
        return $this->db->fetchAll(
            "SELECT * FROM network_devices WHERE status = 'active' ORDER BY last_seen DESC"
        );
    }

    public function getTrafficData($deviceId = null) {
        $sql = "SELECT nt.*, nd.device_name, nd.mac_address 
                FROM network_traffic nt 
                LEFT JOIN network_devices nd ON nt.device_id = nd.id 
                WHERE nt.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        $params = [];
        
        if ($deviceId) {
            $sql .= " AND nt.device_id = ?";
            $params[] = $deviceId;
        }
        
        $sql .= " ORDER BY nt.timestamp DESC LIMIT 100";
        
        return $this->db->fetchAll($sql, $params);
    }

    public function startMonitoring() {
        // Simulate starting network monitoring
        $this->simulateNetworkData();
        return ['success' => true, 'message' => 'Monitoring started'];
    }

    public function stopMonitoring() {
        // Simulate stopping network monitoring
        return ['success' => true, 'message' => 'Monitoring stopped'];
    }

    public function getDashboardStats() {
        $activeDevices = $this->db->fetchOne(
            "SELECT COUNT(*) as count FROM network_devices WHERE status = 'active'"
        )['count'];
        
        $alertCount = $this->db->fetchOne(
            "SELECT COUNT(*) as count FROM network_alerts WHERE resolved = 0"
        )['count'];
        
        $dataTransfer = $this->db->fetchOne(
            "SELECT SUM(bytes_sent + bytes_received) as total 
             FROM network_traffic 
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
        )['total'] ?? 0;
        
        $reportCount = $this->db->fetchOne(
            "SELECT COUNT(*) as count FROM analysis_reports"
        )['count'];
        
        return [
            'active_devices' => $activeDevices,
            'alert_count' => $alertCount,
            'data_transfer' => $dataTransfer,
            'report_count' => $reportCount
        ];
    }

    public function getAlerts() {
        return $this->db->fetchAll(
            "SELECT na.*, nd.device_name 
             FROM network_alerts na 
             LEFT JOIN network_devices nd ON na.device_id = nd.id 
             ORDER BY na.created_at DESC 
             LIMIT 10"
        );
    }

    private function simulateNetworkData() {
        // Add some sample devices if none exist
        $deviceCount = $this->db->fetchOne(
            "SELECT COUNT(*) as count FROM network_devices"
        )['count'];
        
        if ($deviceCount == 0) {
            $sampleDevices = [
                ['device_name' => 'iPhone 12', 'mac_address' => '00:1B:63:84:45:E6', 'ip_address' => '192.168.1.101', 'device_type' => 'Mobile'],
                ['device_name' => 'MacBook Pro', 'mac_address' => '00:1B:63:84:45:E7', 'ip_address' => '192.168.1.102', 'device_type' => 'Laptop'],
                ['device_name' => 'Smart TV', 'mac_address' => '00:1B:63:84:45:E8', 'ip_address' => '192.168.1.103', 'device_type' => 'Smart TV'],
                ['device_name' => 'Desktop PC', 'mac_address' => '00:1B:63:84:45:E9', 'ip_address' => '192.168.1.104', 'device_type' => 'Desktop']
            ];
            
            foreach ($sampleDevices as $device) {
                $this->db->insert('network_devices', $device);
            }
        }
        
        // Add some sample alerts
        $alertCount = $this->db->fetchOne(
            "SELECT COUNT(*) as count FROM network_alerts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)"
        )['count'];
        
        if ($alertCount < 3) {
            $sampleAlerts = [
                ['alert_type' => 'High Bandwidth Usage', 'severity' => 'medium', 'message' => 'Device 192.168.1.101 using excessive bandwidth', 'device_id' => 1],
                ['alert_type' => 'Suspicious Connection', 'severity' => 'high', 'message' => 'Multiple failed login attempts detected', 'device_id' => 2],
                ['alert_type' => 'New Device Connected', 'severity' => 'low', 'message' => 'Unknown device connected to network', 'device_id' => null]
            ];
            
            foreach ($sampleAlerts as $alert) {
                $this->db->insert('network_alerts', $alert);
            }
        }
    }
}
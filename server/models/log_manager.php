<?php
class LogManager {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getRecentLogs($limit = 100, $search = '') {
        try {
            $sql = "SELECT * FROM network_logs WHERE 1=1";
            $params = [];

            if (!empty($search)) {
                $sql .= " AND (message LIKE ? OR ip_address LIKE ? OR log_level LIKE ?)";
                $searchTerm = "%{$search}%";
                $params = [$searchTerm, $searchTerm, $searchTerm];
            }

            $sql .= " ORDER BY timestamp DESC LIMIT ?";
            $params[] = (int)$limit;

            $logs = $this->db->fetchAll($sql, $params);

            return [
                'success' => true,
                'data' => $logs
            ];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function addLog($logData) {
        try {
            $errors = validateInput($logData, ['message', 'log_level']);
            if (!empty($errors)) {
                return ['success' => false, 'errors' => $errors];
            }

            $logEntry = [
                'timestamp' => $logData['timestamp'] ?? date('Y-m-d H:i:s'),
                'log_level' => $logData['log_level'],
                'message' => $logData['message'],
                'ip_address' => $logData['ip_address'] ?? null,
                'user_agent' => $logData['user_agent'] ?? null,
                'additional_data' => isset($logData['additional_data']) ? json_encode($logData['additional_data']) : null
            ];

            $this->db->insert('network_logs', $logEntry);

            return [
                'success' => true,
                'message' => 'Log entry added successfully'
            ];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function generateSampleLogs() {
        $sampleLogs = [
            [
                'timestamp' => date('Y-m-d H:i:s'),
                'log_level' => 'info',
                'message' => 'User login successful from 192.168.1.100',
                'ip_address' => '192.168.1.100'
            ],
            [
                'timestamp' => date('Y-m-d H:i:s', strtotime('-5 minutes')),
                'log_level' => 'warning',
                'message' => 'Multiple failed login attempts detected',
                'ip_address' => '192.168.1.45'
            ],
            [
                'timestamp' => date('Y-m-d H:i:s', strtotime('-10 minutes')),
                'log_level' => 'error',
                'message' => 'Port scanning activity detected from external IP',
                'ip_address' => '203.0.113.42'
            ],
            [
                'timestamp' => date('Y-m-d H:i:s', strtotime('-15 minutes')),
                'log_level' => 'info',
                'message' => 'Large file transfer completed successfully',
                'ip_address' => '192.168.1.75'
            ]
        ];

        $results = [];
        foreach ($sampleLogs as $log) {
            $results[] = $this->addLog($log);
        }

        return $results;
    }

    public function cleanupOldLogs() {
        try {
            $retentionDays = Config::LOG_RETENTION_DAYS;
            $sql = "DELETE FROM network_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)";
            $this->db->query($sql, [$retentionDays]);

            return ['success' => true, 'message' => 'Old logs cleaned up successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
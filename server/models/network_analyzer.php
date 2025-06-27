<?php
class NetworkAnalyzer {
    private $db;
    private $graniteService;

    public function __construct($database) {
        $this->db = $database;
        $this->graniteService = new GraniteService();
    }

    public function getSystemStatus() {
        return [
            'success' => true,
            'data' => [
                'security_status' => 'Secure',
                'traffic_status' => 'Normal',
                'anomaly_count' => rand(0, 3),
                'last_update' => date('Y-m-d H:i:s'),
                'network_health' => rand(85, 99) . '%',
                'active_connections' => rand(150, 300),
                'blocked_ips' => rand(5, 15)
            ]
        ];
    }

    public function runAnalysis($timeframe = '24h') {
        // Convert timeframe to hours
        $hours = $this->parseTimeframe($timeframe);
        
        // Get logs for the specified timeframe
        $logs = $this->getLogsForTimeframe($hours);
        
        // Analyze with both models
        $granite33Analysis = $this->graniteService->analyzeNetworkLogs($logs, 'granite33');
        $granite40Analysis = $this->graniteService->analyzeNetworkLogs($logs, 'granite40');
        
        // Combine results
        $combinedAnalysis = [
            'timeframe' => $timeframe,
            'total_logs_analyzed' => count($logs),
            'granite33_results' => $granite33Analysis,
            'granite40_results' => $granite40Analysis,
            'overall_risk' => $this->calculateOverallRisk($granite33Analysis, $granite40Analysis),
            'key_findings' => $this->generateKeyFindings($granite33Analysis, $granite40Analysis),
            'generated_at' => date('Y-m-d H:i:s')
        ];

        // Store analysis results
        $this->storeAnalysisResults($combinedAnalysis);

        return [
            'success' => true,
            'data' => $combinedAnalysis
        ];
    }

    public function getAnalysisHistory($limit = 10) {
        try {
            $sql = "SELECT * FROM analysis_history ORDER BY created_at DESC LIMIT ?";
            $results = $this->db->fetchAll($sql, [$limit]);
            
            return [
                'success' => true,
                'data' => array_map(function($row) {
                    $row['analysis_data'] = json_decode($row['analysis_data'], true);
                    return $row;
                }, $results)
            ];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function parseTimeframe($timeframe) {
        switch ($timeframe) {
            case '1h':
                return 1;
            case '24h':
                return 24;
            case '7d':
                return 168; // 7 * 24
            case '30d':
                return 720; // 30 * 24
            default:
                return 24;
        }
    }

    private function getLogsForTimeframe($hours) {
        // Simulate network logs
        $logs = [];
        $logCount = rand(50, 200);
        
        for ($i = 0; $i < $logCount; $i++) {
            $logs[] = [
                'timestamp' => date('Y-m-d H:i:s', strtotime("-{$i} minutes")),
                'ip' => $this->generateRandomIP(),
                'action' => ['login', 'logout', 'file_access', 'port_scan', 'data_transfer'][rand(0, 4)],
                'status' => ['success', 'failed', 'blocked'][rand(0, 2)],
                'bytes' => rand(1024, 1048576)
            ];
        }
        
        return $logs;
    }

    private function generateRandomIP() {
        return implode('.', [
            rand(192, 192), // Start with 192 for private IPs
            rand(168, 168),
            rand(1, 254),
            rand(1, 254)
        ]);
    }

    private function calculateOverallRisk($granite33, $granite40) {
        $risks = [$granite33['risk_level'], $granite40['risk_level']];
        
        if (in_array('high', $risks)) return 'high';
        if (in_array('medium', $risks)) return 'medium';
        return 'low';
    }

    private function generateKeyFindings($granite33, $granite40) {
        $findings = [];
        
        if ($granite33['anomalies_detected'] > 0) {
            $findings[] = "Granite 3.3 detected {$granite33['anomalies_detected']} anomalies in recent logs";
        }
        
        if ($granite40['anomalies_detected'] > 0) {
            $findings[] = "Granite 4.0 identified {$granite40['anomalies_detected']} pattern irregularities";
        }
        
        if (empty($findings)) {
            $findings[] = "No significant anomalies detected in the analyzed timeframe";
        }
        
        return $findings;
    }

    private function storeAnalysisResults($analysis) {
        try {
            $this->db->insert('analysis_history', [
                'analysis_data' => json_encode($analysis),
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } catch (Exception $e) {
            logError('Failed to store analysis results: ' . $e->getMessage());
        }
    }
}
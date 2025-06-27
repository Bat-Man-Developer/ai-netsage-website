<?php
class LogAnalyzer {
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->ensureUploadDir();
    }

    private function ensureUploadDir() {
        if (!file_exists(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }
    }

    public function uploadLogFile($file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('File upload failed');
        }

        if ($file['size'] > MAX_FILE_SIZE) {
            throw new Exception('File size exceeds maximum limit');
        }

        $allowedTypes = ['pcap', 'pcapng', 'cap', 'txt', 'log'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($fileExtension, $allowedTypes)) {
            throw new Exception('File type not supported');
        }

        $fileName = time() . '_' . $file['name'];
        $filePath = UPLOAD_DIR . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception('Failed to save uploaded file');
        }

        $logId = $this->db->insert('uploaded_logs', [
            'filename' => $file['name'],
            'file_path' => $filePath,
            'file_type' => $fileExtension,
            'file_size' => $file['size']
        ]);

        return [
            'success' => true,
            'log_id' => $logId,
            'filename' => $file['name']
        ];
    }

    public function analyzeLog($logId) {
        $log = $this->db->fetchOne(
            "SELECT * FROM uploaded_logs WHERE id = ?",
            [$logId]
        );

        if (!$log) {
            throw new Exception('Log file not found');
        }

        // Get API keys
        $apiKeys = $this->db->fetchAll("SELECT service_name, api_key FROM api_keys");
        $keys = [];
        foreach ($apiKeys as $key) {
            $keys[$key['service_name']] = $key['api_key'];
        }

        if (empty($keys['ibm_granite_3_3']) || empty($keys['ibm_granite_4_0'])) {
            throw new Exception('API keys not configured');
        }

        // Read and analyze log file
        $logContent = $this->readLogFile($log['file_path'], $log['file_type']);
        
        // Send to both models
        $granite33Analysis = $this->callIBMModel($logContent, 'granite_3_3', $keys['ibm_granite_3_3']);
        $granite40Analysis = $this->callIBMModel($logContent, 'granite_4_0', $keys['ibm_granite_4_0']);
        
        // Generate combined report
        $combinedReport = $this->generateCombinedReport($granite33Analysis, $granite40Analysis);
        $recommendations = $this->generateRecommendations($granite33Analysis, $granite40Analysis);
        $anomaliesCount = $this->countAnomalies($granite33Analysis, $granite40Analysis);

        // Save analysis results
        $reportId = $this->db->insert('analysis_reports', [
            'log_id' => $logId,
            'granite_3_3_analysis' => $granite33Analysis,
            'granite_4_0_analysis' => $granite40Analysis,
            'combined_report' => $combinedReport,
            'recommendations' => $recommendations,
            'anomalies_detected' => $anomaliesCount
        ]);

        // Mark log as processed
        $this->db->update('uploaded_logs', [
            'processed' => true
        ], ['id' => $logId]);

        return [
            'success' => true,
            'report_id' => $reportId,
            'granite_3_3_analysis' => $granite33Analysis,
            'granite_4_0_analysis' => $granite40Analysis,
            'combined_report' => $combinedReport,
            'recommendations' => $recommendations,
            'anomalies_detected' => $anomaliesCount
        ];
    }

    private function readLogFile($filePath, $fileType) {
        if (!file_exists($filePath)) {
            throw new Exception('Log file not found on disk');
        }

        // For simplicity, we'll read text-based logs directly
        // In a real implementation, you'd use appropriate parsers for pcap files
        if (in_array($fileType, ['txt', 'log'])) {
            return file_get_contents($filePath);
        } else {
            // For binary formats like pcap, you'd use tools like tshark
            return "Binary log file: " . basename($filePath) . " (size: " . filesize($filePath) . " bytes)";
        }
    }

    private function callIBMModel($logContent, $model, $apiKey) {
        // Simulate IBM Watson API call
        sleep(1); // Simulate processing time
        
        if ($model === 'granite_3_3') {
            return "Primary Reasoning Analysis: Network log analysis shows normal traffic patterns with " . 
                   rand(1, 5) . " potential security events detected. Peak usage occurred between 14:00-16:00 UTC. " .
                   "Recommend immediate attention to IP addresses showing suspicious connection patterns. " .
                   "No critical vulnerabilities detected in current session.";
        } else {
            return "Long-Context Pattern Analysis: Historical comparison over 7-day period shows " . 
                   rand(10, 25) . "% increase in overall traffic volume. Video streaming represents " . 
                   rand(30, 50) . "% of bandwidth usage. Consistent daily patterns observed with peak " .
                   "usage during evening hours. Long-term trend analysis suggests normal growth pattern.";
        }
    }

    private function generateCombinedReport($granite33, $granite40) {
        return "COMPREHENSIVE NETWORK ANALYSIS REPORT\n\n" .
               "Real-time Analysis Summary:\n" . $granite33 . "\n\n" .
               "Historical Pattern Analysis:\n" . $granite40 . "\n\n" .
               "Combined Assessment: Network security posture appears stable with normal operational patterns. " .
               "Recommend continued monitoring and implementation of suggested security measures.";
    }

    private function generateRecommendations($granite33, $granite40) {
        $recommendations = [
            "1. Implement continuous monitoring of high-traffic IP addresses",
            "2. Review and update firewall rules based on detected patterns",
            "3. Schedule regular security audits for network infrastructure",
            "4. Consider bandwidth management for video streaming traffic",
            "5. Set up automated alerts for unusual connection patterns"
        ];
        
        return implode("\n", $recommendations);
    }

    private function countAnomalies($granite33, $granite40) {
        // Extract potential anomaly count from analysis text
        preg_match('/(\d+)\s+potential\s+security\s+events?/', $granite33, $matches);
        return isset($matches[1]) ? intval($matches[1]) : rand(0, 3);
    }

    public function getAnalysisResults() {
        return $this->db->fetchAll(
            "SELECT ar.*, ul.filename 
             FROM analysis_reports ar 
             LEFT JOIN uploaded_logs ul ON ar.log_id = ul.id 
             ORDER BY ar.created_at DESC"
        );
    }

    public function getUploadedLogs() {
        return $this->db->fetchAll(
            "SELECT * FROM uploaded_logs ORDER BY upload_timestamp DESC"
        );
    }

    public function deleteLog($logId) {
        $log = $this->db->fetchOne(
            "SELECT * FROM uploaded_logs WHERE id = ?",
            [$logId]
        );

        if (!$log) {
            throw new Exception('Log file not found');
        }

        // Delete file from disk
        if (file_exists($log['file_path'])) {
            unlink($log['file_path']);
        }

        // Delete from database
        $this->db->delete('analysis_reports', ['log_id' => $logId]);
        $this->db->delete('uploaded_logs', ['id' => $logId]);

        return ['success' => true];
    }
}
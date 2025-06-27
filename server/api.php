<?php
require_once 'connection.php';
require_once 'log_processor.php';
require_once 'granite_api.php';
require_once 'report_generator.php';

// Main API Router
class ApiRouter {
    private $db;
    private $logProcessor;
    private $graniteApi;
    private $reportGenerator;
    
    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
        $this->logProcessor = new LogProcessor();
        $this->graniteApi = new GraniteAPI();
        $this->reportGenerator = new ReportGenerator();
    }
    
    public function handleRequest() {
        $endpoint = $_GET['endpoint'] ?? '';
        $method = $_SERVER['REQUEST_METHOD'];
        
        try {
            switch ($endpoint) {
                // Dashboard endpoints
                case 'recent_activity':
                    return $this->getRecentActivity();
                    
                case 'ai_insights':
                    return $this->getAIInsights();
                    
                case 'trend_analysis':
                    return $this->getTrendAnalysis();
                    
                case 'recommendations':
                    return $this->getRecommendations();
                    
                case 'realtime_data':
                    return $this->getRealtimeData();
                
                // Log processing endpoints
                case 'upload_logs':
                    if ($method === 'POST') {
                        return $this->uploadLogs();
                    }
                    break;
                    
                case 'analysis_results':
                    return $this->getAnalysisResults();
                    
                case 'analysis_history':
                    return $this->getAnalysisHistory();
                
                // Model endpoints
                case 'query_granite33':
                    if ($method === 'POST') {
                        return $this->queryGranite33();
                    }
                    break;
                    
                case 'query_granite40':
                    if ($method === 'POST') {
                        return $this->queryGranite40();
                    }
                    break;
                    
                case 'query_combined':
                    if ($method === 'POST') {
                        return $this->queryCombinedModels();
                    }
                    break;
                    
                case 'model_status':
                    return $this->getModelStatus();
                
                // Report endpoints
                case 'generate_report':
                    if ($method === 'POST') {
                        return $this->generateReport();
                    }
                    break;
                    
                case 'reports':
                    return $this->getReports();
                    
                case 'download_report':
                    return $this->downloadReport();
                
                default:
                    sendResponse(['error' => 'Endpoint not found'], 404);
            }
        } catch (Exception $e) {
            logError("API Error: " . $e->getMessage(), ['endpoint' => $endpoint, 'method' => $method]);
            sendResponse(['error' => 'Internal server error'], 500);
        }
    }
    
    private function getRecentActivity() {
        $stmt = $this->db->prepare("
            SELECT timestamp, message, severity, source_ip, event_type 
            FROM network_logs 
            ORDER BY timestamp DESC 
            LIMIT 20
        ");
        $stmt->execute();
        $activities = $stmt->fetchAll();
        
        sendResponse($activities);
    }
    
    private function getAIInsights() {
        $stmt = $this->db->prepare("
            SELECT title, description, confidence, created_at 
            FROM ai_insights 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY confidence DESC, created_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        $insights = $stmt->fetchAll();
        
        sendResponse($insights);
    }
    
    private function getTrendAnalysis() {
        $stmt = $this->db->prepare("
            SELECT pattern, analysis, trend_type, detected_at 
            FROM trend_analysis 
            WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY detected_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        $trends = $stmt->fetchAll();
        
        sendResponse($trends);
    }
    
    private function getRecommendations() {
        $stmt = $this->db->prepare("
            SELECT title, action, priority, category, created_at 
            FROM recommendations 
            WHERE status = 'active'
            ORDER BY priority DESC, created_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        $recommendations = $stmt->fetchAll();
        
        sendResponse($recommendations);
    }
    
    private function getRealtimeData() {
        // Get current system status
        $securityStatus = $this->getSecurityStatus();
        $monitoringCount = $this->getActiveMonitoringCount();
        $anomalyCount = $this->getAnomalyCount();
        
        // Get recent events (last 5 minutes)
        $stmt = $this->db->prepare("
            SELECT timestamp, message, severity 
            FROM network_logs 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            ORDER BY timestamp DESC
        ");
        $stmt->execute();
        $recentEvents = $stmt->fetchAll();
        
        sendResponse([
            'security_status' => $securityStatus,
            'monitoring_count' => $monitoringCount,
            'anomaly_count' => $anomalyCount,
            'recent_events' => $recentEvents
        ]);
    }
    
    private function uploadLogs() {
        if (!isset($_FILES['log_files'])) {
            sendResponse(['error' => 'No files uploaded'], 400);
        }
        
        $files = $_FILES['log_files'];
        $analysisId = $this->logProcessor->processUploadedLogs($files);
        
        if ($analysisId) {
            sendResponse([
                'success' => true,
                'analysis_id' => $analysisId,
                'message' => 'Logs uploaded and processed successfully'
            ]);
        } else {
            sendResponse(['error' => 'Failed to process logs'], 500);
        }
    }
    
    private function queryGranite33() {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!validateRequired($input, ['prompt'])) {
            sendResponse(['error' => 'Prompt is required'], 400);
        }
        
        $prompt = sanitizeInput($input['prompt']);
        $context = sanitizeInput($input['context'] ?? '');
        
        $result = $this->graniteApi->queryGranite33($prompt, $context);
        sendResponse($result);
    }
    
    private function queryGranite40() {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!validateRequired($input, ['prompt'])) {
            sendResponse(['error' => 'Prompt is required'], 400);
        }
        
        $prompt = sanitizeInput($input['prompt']);
        $context = sanitizeInput($input['context'] ?? '');
        
        $result = $this->graniteApi->queryGranite40($prompt, $context);
        sendResponse($result);
    }
    
    private function queryCombinedModels() {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!validateRequired($input, ['prompt'])) {
            sendResponse(['error' => 'Prompt is required'], 400);
        }
        
        $prompt = sanitizeInput($input['prompt']);
        $context = sanitizeInput($input['context'] ?? '');
        
        $result = $this->graniteApi->queryCombinedModels($prompt, $context);
        sendResponse($result);
    }
    
    private function getModelStatus() {
        $status = $this->graniteApi->getModelStatus();
        sendResponse($status);
    }
    
    private function generateReport() {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!validateRequired($input, ['timeframe', 'type'])) {
            sendResponse(['error' => 'Timeframe and type are required'], 400);
        }
        
        $timeframe = sanitizeInput($input['timeframe']);
        $type = sanitizeInput($input['type']);
        
        $reportId = $this->reportGenerator->generateReport($timeframe, $type);
        
        if ($reportId) {
            sendResponse([
                'success' => true,
                'report_id' => $reportId,
                'message' => 'Report generated successfully'
            ]);
        } else {
            sendResponse(['error' => 'Failed to generate report'], 500);
        }
    }
    
    private function getReports() {
        $stmt = $this->db->prepare("
            SELECT id, title, type, timeframe, status, created_at, file_path 
            FROM reports 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmt->execute();
        $reports = $stmt->fetchAll();
        
        sendResponse($reports);
    }
    
    private function downloadReport() {
        $reportId = $_GET['id'] ?? '';
        if (!$reportId) {
            sendResponse(['error' => 'Report ID is required'], 400);
        }
        
        $this->reportGenerator->downloadReport($reportId);
    }
    
    // Helper methods
    private function getSecurityStatus() {
        // Logic to determine security status
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as threat_count 
            FROM network_logs 
            WHERE severity = 'danger' 
            AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ");
        $stmt->execute();
        $result = $stmt->fetch();
        
        if ($result['threat_count'] > 10) {
            return 'High Risk';
        } elseif ($result['threat_count'] > 5) {
            return 'Medium Risk';
        } else {
            return 'Normal';
        }
    }
    
    private function getActiveMonitoringCount() {
        $stmt = $this->db->prepare("SELECT COUNT(DISTINCT source_ip) as count FROM network_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['count'] ?? 0;
    }
    
    private function getAnomalyCount() {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM ai_insights WHERE title LIKE '%anomaly%' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['count'] ?? 0;
    }
}

// Initialize and handle request
$router = new ApiRouter();
$router->handleRequest();
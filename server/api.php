<?php
require_once 'connection.php';
require_once 'models/granite_service.php';
require_once 'models/network_analyzer.php';
require_once 'models/log_manager.php';

class ApiHandler {
    private $db;
    private $graniteService;
    private $networkAnalyzer;
    private $logManager;

    public function __construct() {
        $this->db = new DatabaseConnection();
        $this->graniteService = new GraniteService();
        $this->networkAnalyzer = new NetworkAnalyzer($this->db);
        $this->logManager = new LogManager($this->db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        
        // Remove 'ai-netsage/server' from path parts
        if (count($pathParts) >= 2 && $pathParts[0] === 'ai-netsage' && $pathParts[1] === 'server') {
            $pathParts = array_slice($pathParts, 2);
        }

        $endpoint = $pathParts[0] ?? '';
        $action = $pathParts[1] ?? '';

        try {
            switch ($endpoint) {
                case 'dashboard':
                    $this->handleDashboard($action, $method);
                    break;
                case 'analysis':
                    $this->handleAnalysis($action, $method);
                    break;
                case 'logs':
                    $this->handleLogs($action, $method);
                    break;
                case 'settings':
                    $this->handleSettings($action, $method);
                    break;
                default:
                    sendJsonResponse(['error' => 'Invalid endpoint'], 404);
            }
        } catch (Exception $e) {
            logError('API Error: ' . $e->getMessage());
            sendJsonResponse(['error' => 'Internal server error'], 500);
        }
    }

    private function handleDashboard($action, $method) {
        switch ($action) {
            case 'status':
                if ($method === 'GET') {
                    $status = $this->networkAnalyzer->getSystemStatus();
                    sendJsonResponse($status);
                }
                break;
            case 'insights':
                if ($method === 'GET') {
                    $insights = $this->graniteService->getRealtimeInsights();
                    sendJsonResponse($insights);
                }
                break;
            case 'models':
                if ($method === 'GET') {
                    $modelStatus = $this->graniteService->getModelStatus();
                    sendJsonResponse($modelStatus);
                }
                break;
            default:
                sendJsonResponse(['error' => 'Invalid dashboard action'], 404);
        }
    }

    private function handleAnalysis($action, $method) {
        switch ($action) {
            case 'run':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $timeframe = $input['timeframe'] ?? '24h';
                    
                    $result = $this->networkAnalyzer->runAnalysis($timeframe);
                    sendJsonResponse($result);
                }
                break;
            case 'history':
                if ($method === 'GET') {
                    $history = $this->networkAnalyzer->getAnalysisHistory();
                    sendJsonResponse($history);
                }
                break;
            default:
                sendJsonResponse(['error' => 'Invalid analysis action'], 404);
        }
    }

    private function handleLogs($action, $method) {
        switch ($action) {
            case 'recent':
                if ($method === 'GET') {
                    $limit = $_GET['limit'] ?? 100;
                    $search = $_GET['search'] ?? '';
                    
                    $logs = $this->logManager->getRecentLogs($limit, $search);
                    sendJsonResponse($logs);
                }
                break;
            case 'add':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $result = $this->logManager->addLog($input);
                    sendJsonResponse($result);
                }
                break;
            default:
                sendJsonResponse(['error' => 'Invalid logs action'], 404);
        }
    }

    private function handleSettings($action, $method) {
        switch ($action) {
            case 'get':
                if ($method === 'GET') {
                    $settings = $this->getSettings();
                    sendJsonResponse($settings);
                }
                break;
            case 'update':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $result = $this->updateSettings($input);
                    sendJsonResponse($result);
                }
                break;
            default:
                sendJsonResponse(['error' => 'Invalid settings action'], 404);
        }
    }

    private function getSettings() {
        try {
            $sql = "SELECT setting_key, setting_value FROM settings";
            $rows = $this->db->fetchAll($sql);
            
            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['setting_key']] = json_decode($row['setting_value'], true);
            }
            
            return [
                'success' => true,
                'data' => $settings
            ];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function updateSettings($data) {
        try {
            foreach ($data as $key => $value) {
                $sql = "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) 
                       ON DUPLICATE KEY UPDATE setting_value = ?";
                $jsonValue = json_encode($value);
                $this->db->query($sql, [$key, $jsonValue, $jsonValue]);
            }
            
            return ['success' => true, 'message' => 'Settings updated successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    foreach (Config::getCorsHeaders() as $header) {
        header($header);
    }
    exit;
}

// Initialize and handle request
$api = new ApiHandler();
$api->handleRequest();
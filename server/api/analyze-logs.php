<?php
require_once '../config.php';
require_once '../classes/LogAnalyzer.php';

$action = $_GET['action'] ?? '';
$logAnalyzer = new LogAnalyzer();

try {
    switch ($action) {
        case 'upload':
            if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['logFile'])) {
                $result = $logAnalyzer->uploadLogFile($_FILES['logFile']);
                sendResponse($result);
            } else {
                sendError('No file uploaded');
            }
            break;

        case 'analyze':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $logId = $input['log_id'] ?? null;
                if (!$logId) {
                    sendError('Log ID is required');
                }
                $result = $logAnalyzer->analyzeLog($logId);
                sendResponse($result);
            }
            break;

        case 'results':
            $results = $logAnalyzer->getAnalysisResults();
            sendResponse($results);
            break;

        case 'logs':
            $logs = $logAnalyzer->getUploadedLogs();
            sendResponse($logs);
            break;

        case 'delete':
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $input = json_decode(file_get_contents('php://input'), true);
                $logId = $input['log_id'] ?? null;
                if (!$logId) {
                    sendError('Log ID is required');
                }
                $result = $logAnalyzer->deleteLog($logId);
                sendResponse($result);
            }
            break;

        default:
            sendError('Invalid action');
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
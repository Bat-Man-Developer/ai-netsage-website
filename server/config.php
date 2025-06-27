<?php
// Configuration settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'ai_netsage_database');
define('DB_USER', 'root');
define('DB_PASS', '');

define('UPLOAD_DIR', '../uploads/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB

// API Endpoints
define('IBM_GRANITE_3_3_ENDPOINT', 'https://api.watsonx.ai/v1/');
define('IBM_GRANITE_4_0_ENDPOINT', 'https://api.watsonx.ai/v1/');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'connection.php';

// Helper functions
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function sendError($message, $status = 400) {
    sendResponse(['error' => true, 'message' => $message], $status);
}

function validateApiKey($key) {
    return !empty($key) && strlen($key) > 10;
}

function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
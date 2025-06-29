<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'ConfigurationManager.php';

try {
    $configManager = new ConfigurationManager();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Handle configuration save
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            // Handle form data
            $input = $_POST;
        }
        
        $result = $configManager->saveConfiguration($input['configs']);
        echo json_encode($result);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Handle configuration retrieval
        $result = $configManager->getConfiguration();
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
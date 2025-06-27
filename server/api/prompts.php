<?php
require_once '../config.php';

$action = $_GET['action'] ?? '';
$db = new Database();

try {
    switch ($action) {
        case 'send':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $prompt = $input['prompt'] ?? '';
                $model = $input['model'] ?? '';
                
                if (empty($prompt) || empty($model)) {
                    sendError('Prompt and model are required');
                }
                
                $result = sendPromptToModel($prompt, $model, $db);
                sendResponse($result);
            }
            break;

        case 'history':
            $prompts = $db->fetchAll(
                "SELECT * FROM analysis_prompts ORDER BY created_at DESC LIMIT 50"
            );
            sendResponse($prompts);
            break;

        case 'delete':
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $input = json_decode(file_get_contents('php://input'), true);
                $promptId = $input['prompt_id'] ?? null;
                
                if (!$promptId) {
                    sendError('Prompt ID is required');
                }
                
                $db->delete('analysis_prompts', ['id' => $promptId]);
                sendResponse(['success' => true]);
            }
            break;

        case 'clear':
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $db->query("DELETE FROM analysis_prompts");
                sendResponse(['success' => true]);
            }
            break;

        default:
            sendError('Invalid action');
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}

function sendPromptToModel($prompt, $model, $db) {
    $startTime = microtime(true);
    
    // Get API key for the model
    $apiKey = $db->fetchOne(
        "SELECT api_key FROM api_keys WHERE service_name = ?",
        ["ibm_{$model}"]
    );
    
    if (!$apiKey || empty($apiKey['api_key'])) {
        throw new Exception("API key not configured for {$model}");
    }
    
    // Save prompt to database
    $promptId = $db->insert('analysis_prompts', [
        'prompt_text' => $prompt,
        'model_type' => $model,
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
    try {
        // Simulate API call to IBM Watson
        $response = callIBMWatsonAPI($prompt, $model, $apiKey['api_key']);
        
        $processingTime = microtime(true) - $startTime;
        
        // Update with response
        $db->update('analysis_prompts', [
            'response' => $response,
            'processing_time' => round($processingTime, 3)
        ], ['id' => $promptId]);
        
        return [
            'success' => true,
            'prompt_id' => $promptId,
            'response' => $response,
            'processing_time' => round($processingTime, 3)
        ];
        
    } catch (Exception $e) {
        // Update with error
        $db->update('analysis_prompts', [
            'response' => 'Error: ' . $e->getMessage()
        ], ['id' => $promptId]);
        
        throw $e;
    }
}

function callIBMWatsonAPI($prompt, $model, $apiKey) {
    // This is a placeholder for actual IBM Watson API integration
    // You would implement the actual API calls here
    
    $endpoint = ($model === 'granite_3_3') ? IBM_GRANITE_3_3_ENDPOINT : IBM_GRANITE_4_0_ENDPOINT;
    
    // Simulate API response for demonstration
    sleep(2); // Simulate processing time
    
    if ($model === 'granite_3_3') {
        return "IBM Granite 3.3 Instruct analysis: Based on the network logs provided, I've identified several key patterns and anomalies. The analysis shows normal traffic patterns with occasional spikes during peak hours. Recommendations include monitoring specific IP ranges for unusual activity.";
    } else {
        return "IBM Granite 4.0 Tiny long-context analysis: Historical pattern analysis over the past week shows consistent usage trends with a 15% increase in video streaming traffic. No significant security threats detected, but recommend continued monitoring of bandwidth usage patterns.";
    }
}
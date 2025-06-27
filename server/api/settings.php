<?php
require_once '../config.php';

$action = $_GET['action'] ?? '';
$db = new Database();

try {
    switch ($action) {
        case 'save_keys':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                foreach ($input as $service => $key) {
                    if (validateApiKey($key)) {
                        $existing = $db->fetchOne(
                            "SELECT id FROM api_keys WHERE service_name = ?",
                            [$service]
                        );
                        
                        if ($existing) {
                            $db->update('api_keys', [
                                'api_key' => $key,
                                'updated_at' => date('Y-m-d H:i:s')
                            ], ['service_name' => $service]);
                        } else {
                            $db->insert('api_keys', [
                                'service_name' => $service,
                                'api_key' => $key
                            ]);
                        }
                    }
                }
                
                sendResponse(['success' => true]);
            }
            break;

        case 'get_keys':
            $keys = $db->fetchAll("SELECT service_name, api_key FROM api_keys");
            $result = [];
            foreach ($keys as $key) {
                $result[$key['service_name']] = $key['api_key'];
            }
            sendResponse($result);
            break;

        default:
            sendError('Invalid action');
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
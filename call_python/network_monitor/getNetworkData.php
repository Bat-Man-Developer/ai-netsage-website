<?php
/**
 * Network Monitor PHP Interface
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class NetworkMonitor
{
    private $pythonExePath = "c:/Users/user/anaconda3/python.exe";
    private $scriptPath = "c:/Xampp/htdocs/ai-netsage-website/python/network_monitor/network_monitor.py";

    private function executeCommand($action, $duration = 2)
    {
        $escapedPythonScript = escapeshellarg($this->scriptPath);
        $escapedAction = escapeshellarg($action);
        $escapedDuration = escapeshellarg($duration);
        
        $fullCommand = $this->pythonExePath . " " . $escapedPythonScript . " " . $escapedAction . " " . $escapedDuration . " 2>&1";
        
        return shell_exec($fullCommand);
    }

    public function getNetworkData($action, $duration = 2)
    {
        // Check if Python script exists
        if (!file_exists($this->scriptPath)) {
            return json_encode([
                'success' => false,
                'error' => 'Python script not found at: ' . $this->scriptPath
            ]);
        }

        // Execute the command
        $output = $this->executeCommand($action, $duration);

        if ($output === null) {
            return json_encode([
                'success' => false,
                'error' => 'Failed to execute Python script'
            ]);
        }

        // Try to decode JSON output
        $result = json_decode(trim($output), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return json_encode([
                'success' => false,
                'error' => 'Python script output error: ' . trim($output)
            ]);
        }

        // If Python script returned an error
        if (isset($result['error'])) {
            return json_encode([
                'success' => false,
                'error' => $result['error']
            ]);
        }

        // Return successful response
        return json_encode([
            'success' => true,
            'data' => $result['data'] ?? [],
            'timestamp' => time()
        ]);
    }
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    // Get and decode JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }

    $action = $data['action'] ?? 'capture';
    $duration = $data['duration'] ?? 2;

    $networkMonitor = new NetworkMonitor();
    echo $networkMonitor->getNetworkData($action, $duration);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => time()
    ]);
}
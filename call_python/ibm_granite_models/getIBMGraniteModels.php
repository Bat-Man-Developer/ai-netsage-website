<?php
/**
 * IBM Granite Models PHP Interface
 */

// Start output buffering to prevent any accidental output
ob_start();

// Clear any previous output
if (ob_get_level()) {
    ob_clean();
}

// Set headers first
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Turn off error display to prevent HTML errors in JSON output
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

require_once '../../server/ConfigurationManager.php';

class IBMGraniteModels
{
    private $pythonExePath = "c:/Users/user/anaconda3/python.exe";
    private $scriptPath = "c:/Xampp/htdocs/ai-netsage-website/python/ibm_granite_models/ibm_granite_models.py";
    private $configManager;

    public function __construct()
    {
        $this->configManager = new ConfigurationManager();
    }

    private function getConfiguration()
    {
        $result = $this->configManager->getConfiguration();
        if (!$result['success']) {
            throw new Exception('Failed to load configuration: ' . $result['message']);
        }
        return $result['data'];
    }

    private function executeCommand($modelType, $prompt)
    {
        try {
            $config = $this->getConfiguration();
            
            // Create a temporary config file for Python script
            $tempConfigFile = tempnam(sys_get_temp_dir(), 'granite_config_');
            if ($tempConfigFile === false) {
                throw new Exception('Failed to create temporary config file');
            }
            
            // Create a temporary prompt file to handle large prompts and special characters
            $tempPromptFile = tempnam(sys_get_temp_dir(), 'granite_prompt_');
            if ($tempPromptFile === false) {
                unlink($tempConfigFile);
                throw new Exception('Failed to create temporary prompt file');
            }
            
            $jsonConfig = json_encode($config);
            if ($jsonConfig === false) {
                unlink($tempConfigFile);
                unlink($tempPromptFile);
                throw new Exception('Failed to encode configuration to JSON');
            }
            
            if (file_put_contents($tempConfigFile, $jsonConfig) === false) {
                unlink($tempConfigFile);
                unlink($tempPromptFile);
                throw new Exception('Failed to write configuration file');
            }
            
            if (file_put_contents($tempPromptFile, $prompt) === false) {
                unlink($tempConfigFile);
                unlink($tempPromptFile);
                throw new Exception('Failed to write prompt file');
            }
            
            $escapedPythonScript = escapeshellarg($this->scriptPath);
            $escapedModelType = escapeshellarg($modelType);
            $escapedConfigFile = escapeshellarg($tempConfigFile);
            $escapedPromptFile = escapeshellarg($tempPromptFile);
            
            // Use file-based approach for better handling of large prompts
            $fullCommand = $this->pythonExePath . " " . $escapedPythonScript . " " . $escapedModelType . " " . $escapedPromptFile . " " . $escapedConfigFile . " 2>nul";
            
            $output = shell_exec($fullCommand);
            
            // Clean up temp files
            if (file_exists($tempConfigFile)) {
                unlink($tempConfigFile);
            }
            if (file_exists($tempPromptFile)) {
                unlink($tempPromptFile);
            }
            
            return $output;
        } catch (Exception $e) {
            throw new Exception('Configuration error: ' . $e->getMessage());
        }
    }

    public function getModelResponse($modelType, $prompt)
    {
        try {
            // Validate inputs
            if (empty($modelType) || empty($prompt)) {
                return [
                    'success' => false,
                    'error' => 'Model type and prompt are required'
                ];
            }

            $validModels = ['granite33', 'granite40'];
            if (!in_array($modelType, $validModels)) {
                return [
                    'success' => false,
                    'error' => 'Invalid model type. Must be granite33 or granite40'
                ];
            }

            // Increased limit for network logs
            if (strlen($prompt) > 50000) {
                return [
                    'success' => false,
                    'error' => 'Prompt too long. Maximum 50000 characters allowed'
                ];
            }

            // Check if Python script exists
            if (!file_exists($this->scriptPath)) {
                return [
                    'success' => false,
                    'error' => 'Python script not found at: ' . $this->scriptPath
                ];
            }

            // Check if Python executable exists
            if (!file_exists($this->pythonExePath)) {
                return [
                    'success' => false,
                    'error' => 'Python executable not found at: ' . $this->pythonExePath
                ];
            }

            // Execute the command
            $output = $this->executeCommand($modelType, $prompt);

            if ($output === null || $output === false) {
                return [
                    'success' => false,
                    'error' => 'Failed to execute Python script'
                ];
            }

            $output = trim($output);
            if (empty($output)) {
                return [
                    'success' => false,
                    'error' => 'Python script produced no output'
                ];
            }

            // Extract JSON from output (last line should be JSON)
            $lines = explode("\n", $output);
            $jsonLine = end($lines);
            
            // Try to decode JSON output
            $result = json_decode($jsonLine, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return [
                    'success' => false,
                    'error' => 'Invalid JSON response from Python script. Raw output: ' . substr($output, 0, 500)
                ];
            }

            // If Python script returned an error
            if (isset($result['error'])) {
                return [
                    'success' => false,
                    'error' => $result['error']
                ];
            }

            // Return successful response
            return [
                'success' => true,
                'response' => $result['response'] ?? 'No response from model',
                'model_type' => $modelType,
                'timestamp' => time()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    // Get and decode JSON input
    $input = file_get_contents('php://input');
    if ($input === false) {
        throw new Exception('Failed to read input');
    }
    
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }

    $modelType = $data['model_type'] ?? '';
    $prompt = $data['prompt'] ?? '';

    $graniteModels = new IBMGraniteModels();
    $result = $graniteModels->getModelResponse($modelType, $prompt);
    
    // Clean output buffer before sending JSON
    ob_end_clean();
    echo json_encode($result);
    
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => time()
    ]);
}
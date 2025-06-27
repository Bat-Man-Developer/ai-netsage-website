<?php
require_once 'connection.php';

class GraniteAPI {
    private $granite33_endpoint;
    private $granite40_endpoint;
    private $api_key;
    
    public function __construct() {
        // These would be configured based on your IBM Granite API setup
        $this->granite33_endpoint = 'https://api.ibm.com/granite/3.3/instruct';
        $this->granite40_endpoint = 'https://api.ibm.com/granite/4.0/tiny';
        $this->api_key = 'your_ibm_api_key_here';
    }
    
    public function queryGranite33($prompt, $context = '') {
        try {
            // Prepare the request for Granite 3.3 Instruct
            $requestData = [
                'prompt' => $this->buildGranite33Prompt($prompt, $context),
                'max_tokens' => 1000,
                'temperature' => 0.3,
                'top_p' => 0.9
            ];
            
            $response = $this->makeAPIRequest($this->granite33_endpoint, $requestData);
            
            if ($response && isset($response['choices'][0]['text'])) {
                $analysis = $this->parseGranite33Response($response['choices'][0]['text']);
                
                // Store the analysis
                $this->storeAIInteraction('granite33', $prompt, $analysis['raw_response']);
                
                return [
                    'success' => true,
                    'analysis' => $analysis['summary'],
                    'recommendations' => $analysis['recommendations'],
                    'confidence' => $analysis['confidence']
                ];
            } else {
                throw new Exception('Invalid response from Granite 3.3');
            }
            
        } catch (Exception $e) {
            logError("Granite 3.3 query failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to analyze with Granite 3.3: ' . $e->getMessage()
            ];
        }
    }
    
    public function queryGranite40($prompt, $context = '') {
        try {
            // Prepare the request for Granite 4.0 Tiny (long-context)
            $requestData = [
                'prompt' => $this->buildGranite40Prompt($prompt, $context),
                'max_tokens' => 1500,
                'temperature' => 0.2,
                'context_length' => 8192 // Long context for pattern analysis
            ];
            
            $response = $this->makeAPIRequest($this->granite40_endpoint, $requestData);
            
            if ($response && isset($response['choices'][0]['text'])) {
                $analysis = $this->parseGranite40Response($response['choices'][0]['text']);
                
                // Store the analysis
                $this->storeAIInteraction('granite40', $prompt, $analysis['raw_response']);
                
                return [
                    'success' => true,
                    'analysis' => $analysis['pattern_analysis'],
                    'trends' => $analysis['trends'],
                    'confidence' => $analysis['confidence']
                ];
            } else {
                throw new Exception('Invalid response from Granite 4.0');
            }
            
        } catch (Exception $e) {
            logError("Granite 4.0 query failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to analyze with Granite 4.0: ' . $e->getMessage()
            ];
        }
    }
    
    public function queryCombinedModels($prompt, $context = '') {
        try {
            // Query both models
            $granite33Result = $this->queryGranite33($prompt, $context);
            $granite40Result = $this->queryGranite40($prompt, $context);
            
            if (!$granite33Result['success'] || !$granite40Result['success']) {
                throw new Exception('One or both models failed to respond');
            }
            
            // Combine the results
            $combinedAnalysis = $this->combineAnalysis($granite33Result, $granite40Result);
            
            return [
                'success' => true,
                'granite33_analysis' => $granite33Result['analysis'],
                'granite40_analysis' => $granite40Result['analysis'],
                'combined_recommendations' => $combinedAnalysis['recommendations'],
                'overall_confidence' => $combinedAnalysis['confidence']
            ];
            
        } catch (Exception $e) {
            logError("Combined model query failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to perform combined analysis: ' . $e->getMessage()
            ];
        }
    }
    
    public function getModelStatus() {
        try {
            // Check if both models are responsive
            $granite33Status = $this->checkModelHealth($this->granite33_endpoint);
            $granite40Status = $this->checkModelHealth($this->granite40_endpoint);
            
            return [
                'online' => $granite33Status && $granite40Status,
                'granite33' => $granite33Status,
                'granite40' => $granite40Status,
                'last_check' => date('Y-m-d H:i:s')
            ];
            
        } catch (Exception $e) {
            return [
                'online' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    private function buildGranite33Prompt($userPrompt, $context) {
        $systemPrompt = "You are an expert network security analyst. Analyze the following network data and provide actionable insights. Focus on:
1. Security threats and anomalies
2. Performance issues
3. Specific recommendations for remediation
4. Risk assessment

Network context: " . $context;
        
        return $systemPrompt . "\n\nUser Query: " . $userPrompt . "\n\nProvide a structured analysis with clear recommendations.";
    }
    
    private function buildGranite40Prompt($userPrompt, $context) {
        $systemPrompt = "You are a network pattern analysis expert. Analyze the following data for long-term trends and patterns. Focus on:
1. Historical pattern recognition
2. Trend analysis over time
3. Anomaly detection in patterns
4. Predictive insights

Historical context: " . $context;
        
        return $systemPrompt . "\n\nUser Query: " . $userPrompt . "\n\nProvide detailed pattern analysis and trend identification.";
    }
    
    private function makeAPIRequest($endpoint, $data) {
        // For demo purposes, return mock responses
        // In production, this would make actual HTTP requests to IBM Granite APIs
        
        if (strpos($endpoint, 'granite/3.3') !== false) {
            return [
                'choices' => [
                    [
                        'text' => "ANALYSIS: Based on the network logs provided, I've identified several concerning patterns:\n\n1. SECURITY FINDINGS:\n- Multiple failed login attempts from IP range 192.168.1.x (15 attempts in 1 hour)\n- Unusual outbound traffic to unknown domains\n- Port scanning activity detected from external sources\n\n2. RECOMMENDATIONS:\n- Immediately block IP range 192.168.1.x\n- Implement rate limiting on login attempts\n- Monitor outbound DNS queries for data exfiltration\n- Enable firewall logging for port scan detection\n\n3. RISK ASSESSMENT: HIGH\nThe combination of failed logins and port scanning suggests a coordinated attack attempt.\n\nCONFIDENCE: 0.87"
                    ]
                ]
            ];
        } else {
            return [
                'choices' => [
                    [
                        'text' => "PATTERN ANALYSIS: Long-term analysis reveals several significant trends:\n\n1. TRAFFIC PATTERNS:\n- Bandwidth usage shows 40% increase over past 30 days\n- Peak usage shifted from 2PM-4PM to 10AM-12PM\n- Weekend traffic increased by 25%\n\n2. SECURITY TRENDS:\n- Failed login attempts follow weekly pattern (high on Mondays)\n- Suspicious activity correlates with business hours\n- External port scans increased 60% in last 14 days\n\n3. DETECTED TRENDS:\n- Growing remote access usage\n- Increased cloud service adoption\n- Potential insider threat indicators\n\nCONFIDENCE: 0.92"
                    ]
                ]
            ];
        }
    }
    
    private function parseGranite33Response($response) {
        // Parse the structured response from Granite 3.3
        $sections = explode("\n\n", $response);
        $recommendations = [];
        $confidence = 0.8; // Default
        
        foreach ($sections as $section) {
            if (strpos($section, 'RECOMMENDATIONS:') !== false) {
                $recLines = explode("\n", $section);
                foreach ($recLines as $line) {
                    if (strpos($line, '- ') === 0) {
                        $recommendations[] = substr($line, 2);
                    }
                }
            }
            if (strpos($section, 'CONFIDENCE:') !== false) {
                preg_match('/CONFIDENCE:\s*([0-9.]+)/', $section, $matches);
                if (isset($matches[1])) {
                    $confidence = floatval($matches[1]);
                }
            }
        }
        
        return [
            'summary' => $response,
            'recommendations' => $recommendations,
            'confidence' => $confidence,
            'raw_response' => $response
        ];
    }
    
    private function parseGranite40Response($response) {
        // Parse the pattern analysis response from Granite 4.0
        $sections = explode("\n\n", $response);
        $trends = [];
        $confidence = 0.8; // Default
        
        foreach ($sections as $section) {
            if (strpos($section, 'DETECTED TRENDS:') !== false) {
                $trendLines = explode("\n", $section);
                foreach ($trendLines as $line) {
                    if (strpos($line, '- ') === 0) {
                        $trends[] = substr($line, 2);
                    }
                }
            }
            if (strpos($section, 'CONFIDENCE:') !== false) {
                preg_match('/CONFIDENCE:\s*([0-9.]+)/', $section, $matches);
                if (isset($matches[1])) {
                    $confidence = floatval($matches[1]);
                }
            }
        }
        
        return [
            'pattern_analysis' => $response,
            'trends' => $trends,
            'confidence' => $confidence,
            'raw_response' => $response
        ];
    }
    
    private function combineAnalysis($granite33Result, $granite40Result) {
        // Combine insights from both models
        $combinedRecommendations = array_merge(
            $granite33Result['recommendations'] ?? [],
            $granite40Result['trends'] ?? []
        );
        
        // Add synthesized recommendations
        $combinedRecommendations[] = "Implement continuous monitoring based on identified patterns";
        $combinedRecommendations[] = "Establish baseline metrics for detected trends";
        $combinedRecommendations[] = "Create automated alerts for anomaly thresholds";
        
        $averageConfidence = (
            ($granite33Result['confidence'] ?? 0.8) + 
            ($granite40Result['confidence'] ?? 0.8)
        ) / 2;
        
        return [
            'recommendations' => $combinedRecommendations,
            'confidence' => $averageConfidence
        ];
    }
    
    private function checkModelHealth($endpoint) {
        // For demo purposes, always return true
        // In production, this would ping the actual endpoint
        return true;
    }
    
    private function storeAIInteraction($model, $prompt, $response) {
        try {
            $db = DatabaseConnection::getInstance();
            $stmt = $db->prepare("
                INSERT INTO ai_interactions (model, prompt, response, created_at)
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->execute([$model, $prompt, $response]);
        } catch (Exception $e) {
            logError("Failed to store AI interaction: " . $e->getMessage());
        }
    }
}
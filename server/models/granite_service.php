<?php
class GraniteService {
    private $granite33Url;
    private $granite40Url;

    public function __construct() {
        $this->granite33Url = Config::GRANITE_33_ENDPOINT;
        $this->granite40Url = Config::GRANITE_40_ENDPOINT;
    }

    public function getRealtimeInsights() {
        // Simulate AI analysis results
        $insights = [
            [
                'id' => uniqid(),
                'type' => 'warning',
                'title' => 'Unusual Login Pattern Detected',
                'description' => 'Multiple failed login attempts from IP 192.168.1.45 in the last 10 minutes.',
                'timestamp' => date('Y-m-d H:i:s'),
                'model' => 'Granite 3.3 Instruct',
                'actions' => ['Block IP', 'Monitor User', 'Generate Report'],
                'confidence' => 85
            ],
            [
                'id' => uniqid(),
                'type' => 'info',
                'title' => 'Bandwidth Usage Spike',
                'description' => 'Video streaming traffic increased by 45% compared to last week.',
                'timestamp' => date('Y-m-d H:i:s', strtotime('-5 minutes')),
                'model' => 'Granite 4.0 Tiny',
                'actions' => ['Analyze Traffic', 'Check Capacity'],
                'confidence' => 92
            ],
            [
                'id' => uniqid(),
                'type' => 'success',
                'title' => 'Security Scan Complete',
                'description' => 'Network security scan completed successfully. No threats detected.',
                'timestamp' => date('Y-m-d H:i:s', strtotime('-15 minutes')),
                'model' => 'Granite 3.3 Instruct',
                'actions' => ['View Report'],
                'confidence' => 98
            ]
        ];

        return [
            'success' => true,
            'data' => $insights
        ];
    }

    public function getModelStatus() {
        return [
            'success' => true,
            'data' => [
                'granite33' => [
                    'status' => 'active',
                    'processed_logs' => rand(1500, 2000),
                    'uptime' => '2h 45m',
                    'last_update' => date('Y-m-d H:i:s', strtotime('-2 minutes'))
                ],
                'granite40' => [
                    'status' => 'active',
                    'analyzed_patterns' => rand(50, 100),
                    'uptime' => '2h 45m',
                    'last_update' => date('Y-m-d H:i:s', strtotime('-1 minute'))
                ]
            ]
        ];
    }

    public function analyzeNetworkLogs($logs, $model = 'granite33') {
        // Simulate AI model processing
        $endpoint = $model === 'granite33' ? $this->granite33Url : $this->granite40Url;
        
        // In a real implementation, this would make an HTTP request to the AI model
        // For now, we'll simulate the analysis
        
        $analysis = [
            'anomalies_detected' => rand(0, 5),
            'risk_level' => ['low', 'medium', 'high'][rand(0, 2)],
            'summary' => 'Network analysis completed. ' . rand(0, 5) . ' potential issues identified.',
            'recommendations' => [
                'Monitor high-traffic IPs',
                'Review authentication logs',
                'Check for port scanning activity'
            ],
            'processed_at' => date('Y-m-d H:i:s'),
            'model_used' => $model
        ];

        return $analysis;
    }

    private function makeHttpRequest($url, $data) {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode($data),
                'timeout' => 30
            ]
        ]);

        $response = file_get_contents($url, false, $context);
        
        if ($response === FALSE) {
            throw new Exception("Failed to connect to AI model at {$url}");
        }

        return json_decode($response, true);
    }
}
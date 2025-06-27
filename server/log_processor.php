<?php
require_once 'connection.php';

class LogProcessor {
    private $db;
    
    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
    }
    
    public function processUploadedLogs($files) {
        try {
            $this->db->beginTransaction();
            
            // Create analysis session
            $stmt = $this->db->prepare("
                INSERT INTO analysis_sessions (created_at, status) 
                VALUES (NOW(), 'processing')
            ");
            $stmt->execute();
            $analysisId = $this->db->lastInsertId();
            
            $processedCount = 0;
            
            // Process each uploaded file
            foreach ($files['tmp_name'] as $index => $tmpName) {
                if ($files['error'][$index] === UPLOAD_ERR_OK) {
                    $filename = $files['name'][$index];
                    $content = file_get_contents($tmpName);
                    
                    $logs = $this->parseLogFile($content, $filename);
                    $processedCount += $this->storeLogs($logs, $analysisId);
                }
            }
            
            // Update analysis session
            $stmt = $this->db->prepare("
                UPDATE analysis_sessions 
                SET status = 'completed', processed_logs = ? 
                WHERE id = ?
            ");
            $stmt->execute([$processedCount, $analysisId]);
            
            $this->db->commit();
            
            // Trigger AI analysis
            $this->triggerAIAnalysis($analysisId);
            
            return $analysisId;
            
        } catch (Exception $e) {
            $this->db->rollback();
            logError("Log processing failed: " . $e->getMessage());
            return false;
        }
    }
    
    private function parseLogFile($content, $filename) {
        $logs = [];
        $lines = explode("\n", $content);
        
        foreach ($lines as $lineNum => $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            $logEntry = $this->parseLogLine($line, $filename, $lineNum);
            if ($logEntry) {
                $logs[] = $logEntry;
            }
        }
        
        return $logs;
    }
    
    private function parseLogLine($line, $filename, $lineNum) {
        // Common log patterns
        $patterns = [
            // Apache/Nginx access log
            '/^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^"]*)" (\d+) (\d+|-) "([^"]*)" "([^"]*)"/',
            // Syslog format
            '/^(\w+\s+\d+\s+\d+:\d+:\d+) (\S+) (\S+): (.*)/',
            // Custom network log
            '/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+) from (\d+\.\d+\.\d+\.\d+)/',
            // Firewall log
            '/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\w+) (.+)/'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $line, $matches)) {
                return $this->extractLogData($matches, $pattern, $filename);
            }
        }
        
        // Fallback for unrecognized format
        return [
            'timestamp' => date('Y-m-d H:i:s'),
            'message' => $line,
            'severity' => 'info',
            'source_ip' => null,
            'event_type' => 'unknown',
            'source_file' => $filename,
            'line_number' => $lineNum
        ];
    }
    
    private function extractLogData($matches, $pattern, $filename) {
        $logData = [
            'source_file' => $filename,
            'raw_log' => $matches[0]
        ];
        
        // Extract data based on pattern
        if (strpos($pattern, 'access log') !== false) {
            // Apache/Nginx access log
            $logData['source_ip'] = $matches[1];
            $logData['timestamp'] = $this->parseTimestamp($matches[2]);
            $logData['event_type'] = 'http_request';
            $logData['message'] = $matches[3] . ' ' . $matches[4];
            $logData['severity'] = $this->determineSeverityFromHttpStatus($matches[5]);
        } else if (strpos($pattern, 'network log') !== false) {
            // Custom network log
            $logData['timestamp'] = $matches[1];
            $logData['severity'] = strtolower($matches[2]);
            $logData['message'] = $matches[3];
            $logData['source_ip'] = $matches[4];
            $logData['event_type'] = 'network_event';
        } else {
            // Generic parsing
            $logData['timestamp'] = $this->parseTimestamp($matches[1]);
            $logData['message'] = end($matches);
            $logData['severity'] = 'info';
            $logData['event_type'] = 'system_event';
        }
        
        // Detect potential security issues
        $logData['severity'] = $this->detectSecurityIssues($logData['message'], $logData['severity']);
        
        return $logData;
    }
    
    private function parseTimestamp($timestamp) {
        // Try different timestamp formats
        $formats = [
            'Y-m-d H:i:s',
            'd/M/Y:H:i:s O',
            'M d H:i:s',
            'Y-m-d\TH:i:s\Z'
        ];
        
        foreach ($formats as $format) {
            $date = DateTime::createFromFormat($format, $timestamp);
            if ($date !== false) {
                return $date->format('Y-m-d H:i:s');
            }
        }
        
        return date('Y-m-d H:i:s'); // Fallback to current time
    }
    
    private function determineSeverityFromHttpStatus($status) {
        $status = intval($status);
        
        if ($status >= 500) return 'danger';
        if ($status >= 400) return 'warning';
        if ($status >= 300) return 'info';
        return 'info';
    }
    
    private function detectSecurityIssues($message, $currentSeverity) {
        $securityKeywords = [
            'danger' => ['failed login', 'unauthorized', 'attack', 'intrusion', 'malware', 'virus', 'exploit'],
            'warning' => ['suspicious', 'unusual', 'multiple attempts', 'blocked', 'denied']
        ];
        
        $messageLower = strtolower($message);
        
        foreach ($securityKeywords as $severity => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($messageLower, $keyword) !== false) {
                    return $severity;
                }
            }
        }
        
        return $currentSeverity;
    }
    
    private function storeLogs($logs, $analysisId) {
        $count = 0;
        
        foreach ($logs as $log) {
            try {
                $stmt = $this->db->prepare("
                    INSERT INTO network_logs (
                        analysis_session_id, timestamp, message, severity, 
                        source_ip, event_type, source_file, raw_log
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $analysisId,
                    $log['timestamp'],
                    $log['message'],
                    $log['severity'],
                    $log['source_ip'],
                    $log['event_type'],
                    $log['source_file'],
                    $log['raw_log']
                ]);
                
                $count++;
            } catch (Exception $e) {
                logError("Failed to store log entry: " . $e->getMessage(), $log);
            }
        }
        
        return $count;
    }
    
    private function triggerAIAnalysis($analysisId) {
        // This would trigger the AI models to analyze the uploaded logs
        // For now, we'll create some sample insights
        
        try {
            // Sample AI insights based on log analysis
            $insights = [
                [
                    'title' => 'Unusual Login Pattern Detected',
                    'description' => 'Multiple failed login attempts from IP range 192.168.1.x',
                    'confidence' => 0.85,
                    'analysis_session_id' => $analysisId
                ],
                [
                    'title' => 'Network Traffic Spike',
                    'description' => 'Bandwidth usage increased by 300% in the last hour',
                    'confidence' => 0.92,
                    'analysis_session_id' => $analysisId
                ]
            ];
            
            foreach ($insights as $insight) {
                $stmt = $this->db->prepare("
                    INSERT INTO ai_insights (title, description, confidence, analysis_session_id, created_at)
                    VALUES (?, ?, ?, ?, NOW())
                ");
                $stmt->execute([
                    $insight['title'],
                    $insight['description'],
                    $insight['confidence'],
                    $insight['analysis_session_id']
                ]);
            }
            
            // Generate recommendations
            $recommendations = [
                [
                    'title' => 'Block Suspicious IP Range',
                    'action' => 'Consider blocking IP range 192.168.1.x for 24 hours',
                    'priority' => 'high',
                    'category' => 'security'
                ],
                [
                    'title' => 'Monitor Network Usage',
                    'action' => 'Investigate cause of bandwidth spike and monitor for data exfiltration',
                    'priority' => 'medium',
                    'category' => 'performance'
                ]
            ];
            
            foreach ($recommendations as $rec) {
                $stmt = $this->db->prepare("
                    INSERT INTO recommendations (title, action, priority, category, status, created_at)
                    VALUES (?, ?, ?, ?, 'active', NOW())
                ");
                $stmt->execute([
                    $rec['title'],
                    $rec['action'],
                    $rec['priority'],
                    $rec['category']
                ]);
            }
            
        } catch (Exception $e) {
            logError("Failed to generate AI insights: " . $e->getMessage());
        }
    }
}
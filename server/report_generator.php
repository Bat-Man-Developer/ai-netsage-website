<?php
require_once 'connection.php';

class ReportGenerator {
    private $db;
    
    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
    }
    
    public function generateReport($timeframe, $type) {
        try {
            $this->db->beginTransaction();
            
            // Create report record
            $stmt = $this->db->prepare("
                INSERT INTO reports (title, type, timeframe, status, created_at)
                VALUES (?, ?, ?, 'generating', NOW())
            ");
            
            $title = $this->generateReportTitle($type, $timeframe);
            $stmt->execute([$title, $type, $timeframe]);
            $reportId = $this->db->lastInsertId();
            
            // Generate report content
            $reportData = $this->collectReportData($timeframe, $type);
            $reportContent = $this->formatReportContent($reportData, $type);
            
            // Save report file
            $filePath = $this->saveReportFile($reportId, $reportContent, $type);
            
            // Update report record
            $stmt = $this->db->prepare("
                UPDATE reports 
                SET status = 'completed', file_path = ?, content_summary = ?
                WHERE id = ?
            ");
            $stmt->execute([$filePath, $this->generateSummary($reportData), $reportId]);
            
            $this->db->commit();
            
            return $reportId;
            
        } catch (Exception $e) {
            $this->db->rollback();
            logError("Report generation failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function downloadReport($reportId) {
        try {
            $stmt = $this->db->prepare("
                SELECT title, file_path, type 
                FROM reports 
                WHERE id = ? AND status = 'completed'
            ");
            $stmt->execute([$reportId]);
            $report = $stmt->fetch();
            
            if (!$report || !file_exists($report['file_path'])) {
                sendResponse(['error' => 'Report not found'], 404);
                return;
            }
            
            // Set appropriate headers for download
            $filename = sanitizeFilename($report['title']) . '.pdf';
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($report['file_path']));
            
            readfile($report['file_path']);
            exit;
            
        } catch (Exception $e) {
            logError("Report download failed: " . $e->getMessage());
            sendResponse(['error' => 'Download failed'], 500);
        }
    }
    
    private function collectReportData($timeframe, $type) {
        $dateCondition = $this->getDateCondition($timeframe);
        $data = [];
        
        // Collect network logs
        $stmt = $this->db->prepare("
            SELECT * FROM network_logs 
            WHERE timestamp >= $dateCondition 
            ORDER BY timestamp DESC
        ");
        $stmt->execute();
        $data['network_logs'] = $stmt->fetchAll();
        
        // Collect AI insights
        $stmt = $this->db->prepare("
            SELECT * FROM ai_insights 
            WHERE created_at >= $dateCondition 
            ORDER BY confidence DESC
        ");
        $stmt->execute();
        $data['ai_insights'] = $stmt->fetchAll();
        
        // Collect recommendations
        $stmt = $this->db->prepare("
            SELECT * FROM recommendations 
            WHERE created_at >= $dateCondition 
            ORDER BY priority DESC
        ");
        $stmt->execute();
        $data['recommendations'] = $stmt->fetchAll();
        
        // Collect trend analysis
        $stmt = $this->db->prepare("
            SELECT * FROM trend_analysis 
            WHERE detected_at >= $dateCondition 
            ORDER BY detected_at DESC
        ");
        $stmt->execute();
        $data['trends'] = $stmt->fetchAll();
        
        // Generate statistics
        $data['statistics'] = $this->generateStatistics($data, $timeframe);
        
        return $data;
    }
    
    private function generateStatistics($data, $timeframe) {
        $stats = [];
        
        // Log statistics
        $stats['total_logs'] = count($data['network_logs']);
        $stats['security_events'] = count(array_filter($data['network_logs'], function($log) {
            return $log['severity'] === 'danger';
        }));
        $stats['warning_events'] = count(array_filter($data['network_logs'], function($log) {
            return $log['severity'] === 'warning';
        }));
        
        // AI insights statistics
        $stats['total_insights'] = count($data['ai_insights']);
        $stats['high_confidence_insights'] = count(array_filter($data['ai_insights'], function($insight) {
            return $insight['confidence'] > 0.8;
        }));
        
        // Recommendations statistics
        $stats['total_recommendations'] = count($data['recommendations']);
        $stats['high_priority_recommendations'] = count(array_filter($data['recommendations'], function($rec) {
            return $rec['priority'] === 'high';
        }));
        
        // Unique IPs
        $uniqueIPs = array_unique(array_filter(array_column($data['network_logs'], 'source_ip')));
        $stats['unique_source_ips'] = count($uniqueIPs);
        
        // Most active IPs
        $ipCounts = array_count_values(array_filter(array_column($data['network_logs'], 'source_ip')));
        arsort($ipCounts);
        $stats['top_ips'] = array_slice($ipCounts, 0, 10, true);
        
        return $stats;
    }
    
    private function formatReportContent($data, $type) {
        $html = $this->generateHTMLReport($data, $type);
        
        // In a real implementation, you would convert HTML to PDF using a library like TCPDF or wkhtmltopdf
        // For this demo, we'll save as HTML
        return $html;
    }
    
    private function generateHTMLReport($data, $type) {
        $stats = $data['statistics'];
        $timeGenerated = date('Y-m-d H:i:s');
        
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI NetSage - {$type} Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
                .section { margin: 30px 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
                .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
                .stat-label { color: #64748b; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #2563eb; color: white; }
                .severity-danger { color: #ef4444; font-weight: bold; }
                .severity-warning { color: #f59e0b; font-weight: bold; }
                .severity-info { color: #10b981; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>AI NetSage Network Intelligence Report</h1>
                <h2>" . ucfirst($type) . " Analysis</h2>
                <p>Generated on: {$timeGenerated}</p>
            </div>
            
            <div class='section'>
                <h3>Executive Summary</h3>
                <div class='stats-grid'>
                    <div class='stat-card'>
                        <div class='stat-value'>{$stats['total_logs']}</div>
                        <div class='stat-label'>Total Log Entries</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-value'>{$stats['security_events']}</div>
                        <div class='stat-label'>Security Events</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-value'>{$stats['total_insights']}</div>
                        <div class='stat-label'>AI Insights</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-value'>{$stats['total_recommendations']}</div>
                        <div class='stat-label'>Recommendations</div>
                    </div>
                </div>
            </div>";
        
        // Add AI Insights section
        if (!empty($data['ai_insights'])) {
            $html .= "
            <div class='section'>
                <h3>AI-Powered Insights</h3>
                <table>
                    <tr><th>Insight</th><th>Description</th><th>Confidence</th><th>Detected</th></tr>";
            
            foreach (array_slice($data['ai_insights'], 0, 10) as $insight) {
                $confidence = round($insight['confidence'] * 100) . '%';
                $html .= "
                    <tr>
                        <td>{$insight['title']}</td>
                        <td>{$insight['description']}</td>
                        <td>{$confidence}</td>
                        <td>{$insight['created_at']}</td>
                    </tr>";
            }
            
            $html .= "</table></div>";
        }
        
        // Add Recommendations section
        if (!empty($data['recommendations'])) {
            $html .= "
            <div class='section'>
                <h3>Recommended Actions</h3>
                <table>
                    <tr><th>Action</th><th>Description</th><th>Priority</th><th>Category</th></tr>";
            
            foreach ($data['recommendations'] as $rec) {
                $priorityClass = 'severity-' . $rec['priority'];
                $html .= "
                    <tr>
                        <td>{$rec['title']}</td>
                        <td>{$rec['action']}</td>
                        <td class='{$priorityClass}'>" . ucfirst($rec['priority']) . "</td>
                        <td>{$rec['category']}</td>
                    </tr>";
            }
            
            $html .= "</table></div>";
        }
        
        // Add Top Source IPs section
        if (!empty($stats['top_ips'])) {
            $html .= "
            <div class='section'>
                <h3>Most Active Source IPs</h3>
                <table>
                    <tr><th>IP Address</th><th>Activity Count</th></tr>";
            
            foreach ($stats['top_ips'] as $ip => $count) {
                $html .= "
                    <tr>
                        <td>{$ip}</td>
                        <td>{$count}</td>
                    </tr>";
            }
            
            $html .= "</table></div>";
        }
        
        $html .= "
            <div class='section'>
                <p><em>This report was generated by AI NetSage using IBM Granite 3.3 Instruct and Granite 4.0 Tiny models.</em></p>
            </div>
        </body>
        </html>";
        
        return $html;
    }
    
    private function saveReportFile($reportId, $content, $type) {
        $reportsDir = __DIR__ . '/reports/';
        if (!is_dir($reportsDir)) {
            mkdir($reportsDir, 0755, true);
        }
        
        $filename = "report_{$reportId}_" . date('Y-m-d_H-i-s') . '.html';
        $filePath = $reportsDir . $filename;
        
        if (file_put_contents($filePath, $content) === false) {
            throw new Exception("Failed to save report file");
        }
        
        return $filePath;
    }
    
    private function generateReportTitle($type, $timeframe) {
        $timeframeName = [
            '24h' => 'Last 24 Hours',
            '7d' => 'Last 7 Days',
            '30d' => 'Last 30 Days',
            'custom' => 'Custom Range'
        ][$timeframe] ?? $timeframe;
        
        $typeName = ucfirst($type);
        
        return "{$typeName} Report - {$timeframeName}";
    }
    
    private function getDateCondition($timeframe) {
        switch ($timeframe) {
            case '24h':
                return "DATE_SUB(NOW(), INTERVAL 24 HOUR)";
            case '7d':
                return "DATE_SUB(NOW(), INTERVAL 7 DAY)";
            case '30d':
                return "DATE_SUB(NOW(), INTERVAL 30 DAY)";
            default:
                return "DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }
    }
    
    private function generateSummary($data) {
        $stats = $data['statistics'];
        return "Report contains {$stats['total_logs']} log entries, {$stats['security_events']} security events, and {$stats['total_recommendations']} recommendations.";
    }
}

function sanitizeFilename($filename) {
    return preg_replace('/[^a-zA-Z0-9_-]/', '_', $filename);
}
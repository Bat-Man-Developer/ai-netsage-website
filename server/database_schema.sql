-- AI NetSage Database Schema
USE ai_netsage_database;

-- Network logs table
CREATE TABLE network_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_session_id INT NULL,
    timestamp DATETIME NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info', 'warning', 'danger') DEFAULT 'info',
    source_ip VARCHAR(45) NULL,
    destination_ip VARCHAR(45) NULL,
    port INT NULL,
    protocol VARCHAR(10) NULL,
    event_type VARCHAR(50) NULL,
    source_file VARCHAR(255) NULL,
    line_number INT NULL,
    raw_log TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_severity (severity),
    INDEX idx_source_ip (source_ip),
    INDEX idx_event_type (event_type),
    INDEX idx_analysis_session (analysis_session_id)
);

-- Analysis sessions table
CREATE TABLE analysis_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    processed_logs INT DEFAULT 0,
    total_files INT DEFAULT 0,
    processing_time INT NULL,
    error_message TEXT NULL
);

-- AI insights table
CREATE TABLE ai_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_session_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    insight_type ENUM('security', 'performance', 'anomaly', 'trend') DEFAULT 'security',
    source_model ENUM('granite33', 'granite40', 'combined') DEFAULT 'granite33',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_confidence (confidence),
    INDEX idx_type (insight_type),
    INDEX idx_created (created_at),
    FOREIGN KEY (analysis_session_id) REFERENCES analysis_sessions(id) ON DELETE SET NULL
);

-- Trend analysis table
CREATE TABLE trend_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern VARCHAR(255) NOT NULL,
    analysis TEXT NOT NULL,
    trend_type ENUM('increasing', 'decreasing', 'cyclical', 'anomalous') NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    timeframe VARCHAR(50) NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_data_points INT DEFAULT 0,
    INDEX idx_trend_type (trend_type),
    INDEX idx_detected (detected_at)
);

-- Recommendations table
CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    action TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    category ENUM('security', 'performance', 'maintenance', 'monitoring') DEFAULT 'security',
    status ENUM('active', 'implemented', 'dismissed') DEFAULT 'active',
    estimated_impact VARCHAR(100) NULL,
    implementation_difficulty ENUM('easy', 'medium', 'hard') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- AI interactions table (for logging model queries)
CREATE TABLE ai_interactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model ENUM('granite33', 'granite40', 'combined') NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    processing_time DECIMAL(6,3) NULL,
    tokens_used INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_model (model),
    INDEX idx_created (created_at)
);

-- Reports table
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('security', 'performance', 'comprehensive') NOT NULL,
    timeframe VARCHAR(50) NOT NULL,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    file_path VARCHAR(500) NULL,
    content_summary TEXT NULL,
    file_size INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(100) DEFAULT 'system',
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Configuration table for system settings
CREATE TABLE system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('granite33_endpoint', 'https://api.ibm.com/granite/3.3/instruct', 'IBM Granite 3.3 Instruct API endpoint'),
('granite40_endpoint', 'https://api.ibm.com/granite/4.0/tiny', 'IBM Granite 4.0 Tiny API endpoint'),
('api_key', 'your_api_key_here', 'IBM API key for model access'),
('max_file_size', '10485760', 'Maximum upload file size in bytes (10MB)'),
('retention_days', '90', 'Number of days to retain log data'),
('auto_analysis', 'true', 'Enable automatic AI analysis of uploaded logs'),
('real_time_monitoring', 'true', 'Enable real-time monitoring and alerts');

-- Sample data for testing
INSERT INTO network_logs (timestamp, message, severity, source_ip, event_type) VALUES
('2025-06-27 10:30:00', 'Failed login attempt from suspicious IP', 'danger', '192.168.1.100', 'authentication'),
('2025-06-27 10:31:00', 'Multiple failed SSH connections', 'warning', '192.168.1.100', 'ssh'),
('2025-06-27 10:32:00', 'Port scan detected from external source', 'danger', '203.0.113.45', 'port_scan'),
('2025-06-27 10:33:00', 'Normal HTTP request processed', 'info', '192.168.1.50', 'http_request'),
('2025-06-27 10:34:00', 'Bandwidth usage spike detected', 'warning', '192.168.1.75', 'bandwidth'),
('2025-06-27 10:35:00', 'Firewall rule triggered', 'warning', '198.51.100.30', 'firewall'),
('2025-06-27 10:36:00', 'DNS query to suspicious domain', 'danger', '192.168.1.120', 'dns'),
('2025-06-27 10:37:00', 'User logged in successfully', 'info', '192.168.1.25', 'authentication'),
('2025-06-27 10:38:00', 'File upload completed', 'info', '192.168.1.60', 'file_transfer'),
('2025-06-27 10:39:00', 'Connection timeout occurred', 'warning', '192.168.1.80', 'network');

-- Sample AI insights
INSERT INTO ai_insights (title, description, confidence, insight_type) VALUES
('Brute Force Attack Pattern', 'Multiple failed login attempts detected from IP 192.168.1.100 suggesting brute force attack', 0.92, 'security'),
('Network Bandwidth Anomaly', 'Unusual bandwidth usage pattern detected during off-peak hours', 0.78, 'anomaly'),
('Port Scanning Activity', 'Systematic port scanning detected from external IP addresses', 0.85, 'security'),
('DNS Tunneling Suspected', 'Abnormal DNS query patterns may indicate data exfiltration', 0.73, 'security');

-- Sample recommendations
INSERT INTO recommendations (title, action, priority, category) VALUES
('Block Suspicious IP Range', 'Implement firewall rule to block IP range 192.168.1.100-110 for 24 hours', 'high', 'security'),
('Enable Rate Limiting', 'Configure rate limiting on SSH service to prevent brute force attacks', 'medium', 'security'),
('Monitor DNS Queries', 'Implement DNS monitoring to detect potential data exfiltration attempts', 'medium', 'monitoring'),
('Update Firewall Rules', 'Review and update firewall rules to better detect port scanning', 'low', 'maintenance');

-- Sample trend analysis
INSERT INTO trend_analysis (pattern, analysis, trend_type, confidence, timeframe) VALUES
('Increasing failed login attempts', 'Failed login attempts have increased by 40% over the past week', 'increasing', 0.87, 'weekly'),
('Weekend traffic anomaly', 'Unusual network activity detected during weekend hours', 'anomalous', 0.72, 'weekly'),
('Bandwidth usage growth', 'Overall bandwidth usage showing steady 15% monthly growth', 'increasing', 0.91, 'monthly');

-- Create indexes for better performance
CREATE INDEX idx_logs_composite ON network_logs(timestamp, severity, source_ip);
CREATE INDEX idx_insights_composite ON ai_insights(created_at, confidence, insight_type);
CREATE INDEX idx_recommendations_composite ON recommendations(priority, status, category);

-- Create views for common queries
CREATE VIEW recent_security_events AS
SELECT 
    timestamp,
    message,
    source_ip,
    event_type
FROM network_logs 
WHERE severity IN ('warning', 'danger') 
    AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY timestamp DESC;

CREATE VIEW high_confidence_insights AS
SELECT 
    title,
    description,
    confidence,
    insight_type,
    created_at
FROM ai_insights 
WHERE confidence > 0.8
ORDER BY confidence DESC, created_at DESC;

CREATE VIEW active_recommendations AS
SELECT 
    title,
    action,
    priority,
    category,
    created_at
FROM recommendations 
WHERE status = 'active'
ORDER BY 
    CASE priority 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    created_at DESC;
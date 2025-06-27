-- AI NetSage Database Schema

-- Network logs table
CREATE TABLE network_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    log_level ENUM('info', 'warning', 'error', 'debug') NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    additional_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_log_level (log_level),
    INDEX idx_ip_address (ip_address)
);

-- Analysis history table
CREATE TABLE analysis_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
);

-- Settings table
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('analysis_frequency', '"real-time"'),
('anomaly_threshold', '5'),
('granite33_enabled', 'true'),
('granite40_enabled', 'true'),
('log_retention_days', '30'),
('max_log_entries', '1000');

-- Sample network logs for testing
INSERT INTO network_logs (timestamp, log_level, message, ip_address) VALUES
(NOW() - INTERVAL 1 MINUTE, 'info', 'User login successful', '192.168.1.100'),
(NOW() - INTERVAL 5 MINUTE, 'warning', 'Multiple failed login attempts detected', '192.168.1.45'),
(NOW() - INTERVAL 10 MINUTE, 'error', 'Port scanning activity detected from external IP', '203.0.113.42'),
(NOW() - INTERVAL 15 MINUTE, 'info', 'Large file transfer completed successfully', '192.168.1.75'),
(NOW() - INTERVAL 20 MINUTE, 'warning', 'Unusual bandwidth spike detected', '192.168.1.120'),
(NOW() - INTERVAL 25 MINUTE, 'info', 'Security scan initiated', '192.168.1.1'),
(NOW() - INTERVAL 30 MINUTE, 'error', 'Firewall rule violation detected', '10.0.0.50');
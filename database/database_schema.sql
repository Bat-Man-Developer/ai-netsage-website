-- AI NetSage Database Schema

-- API Keys Configuration
CREATE TABLE api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL,
    api_key TEXT NOT NULL,
    endpoint_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prompts Storage
CREATE TABLE stored_prompts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prompt_name VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    model_type ENUM('granite_33', 'granite_40', 'combined') NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_count INT DEFAULT 0
);

-- Analysis Sessions
CREATE TABLE analysis_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_type ENUM('upload', 'realtime', 'prompt') NOT NULL,
    model_used VARCHAR(100),
    input_data_hash VARCHAR(64),
    analysis_result TEXT,
    anomalies_detected JSON,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INT
);

-- Uploaded Log Files
CREATE TABLE uploaded_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    file_hash VARCHAR(64),
    upload_path VARCHAR(500),
    analysis_session_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_session_id) REFERENCES analysis_sessions(id)
);

-- Real-time Network Data
CREATE TABLE realtime_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_ip VARCHAR(45),
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    port INT,
    protocol VARCHAR(20),
    data_size BIGINT,
    direction ENUM('inbound', 'outbound'),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anomaly_score FLOAT DEFAULT 0
);

-- Anomaly Detection Results
CREATE TABLE anomaly_detections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT,
    anomaly_type VARCHAR(100),
    severity ENUM('low', 'medium', 'high', 'critical'),
    description TEXT,
    affected_ips JSON,
    detection_algorithm VARCHAR(100),
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES analysis_sessions(id)
);

-- Generated Reports
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(255),
    report_type ENUM('daily', 'weekly', 'custom'),
    session_ids JSON,
    report_data JSON,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default API key placeholders
INSERT INTO api_keys (service_name, api_key, endpoint_url) VALUES
('IBM Granite 3.3 Instruct', 'your-granite-33-api-key', 'https://api.ibm.com/granite/3.3/instruct'),
('IBM Granite 4.0 Tiny', 'your-granite-40-api-key', 'https://api.ibm.com/granite/4.0/tiny');

-- Insert sample prompts
INSERT INTO stored_prompts (prompt_name, prompt_text, model_type, category) VALUES
('Basic Log Analysis', 'Analyze the following network logs and identify any suspicious activities or anomalies:', 'granite_33', 'security'),
('Trend Analysis', 'Examine the historical network data for patterns and trends over the specified time period:', 'granite_40', 'monitoring'),
('Combined Security Assessment', 'Perform a comprehensive security analysis using both immediate threat detection and historical pattern analysis:', 'combined', 'security');
-- AI NetSage Database Schema

-- Configuration table
CREATE TABLE configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Network data table
CREATE TABLE network_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    source_port INT,
    destination_port INT,
    packet_length INT,
    captured_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_source_ip (source_ip),
    INDEX idx_destination_ip (destination_ip),
    INDEX idx_captured_at (captured_at),
    INDEX idx_protocol (protocol)
);

-- Anomalies table
CREATE TABLE anomalies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    anomaly_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    detected_at TIMESTAMP NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_anomaly_type (anomaly_type),
    INDEX idx_severity (severity),
    INDEX idx_detected_at (detected_at),
    INDEX idx_resolved (resolved)
);

-- Analysis results table
CREATE TABLE analysis_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_type VARCHAR(50) NOT NULL,
    model_used VARCHAR(50) NOT NULL,
    input_prompt TEXT NOT NULL,
    output_result TEXT NOT NULL,
    confidence_score DECIMAL(5,2),
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_model_used (model_used),
    INDEX idx_created_at (created_at)
);

-- File uploads table
CREATE TABLE file_uploads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    upload_status ENUM('UPLOADED', 'PROCESSING', 'ANALYZED', 'FAILED') DEFAULT 'UPLOADED',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_upload_status (upload_status),
    INDEX idx_uploaded_at (uploaded_at)
);

-- Reports table
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL UNIQUE,
    report_type VARCHAR(50) NOT NULL,
    report_data LONGTEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_type (report_type),
    INDEX idx_generated_at (generated_at)
);

-- Monitoring sessions table
CREATE TABLE monitoring_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL UNIQUE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    status ENUM('ACTIVE', 'PAUSED', 'STOPPED') DEFAULT 'ACTIVE',
    packets_captured INT DEFAULT 0,
    anomalies_detected INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_status (status),
    INDEX idx_start_time (start_time)
);

-- Insert default configuration
INSERT INTO configurations (config_key, config_value) VALUES
('project_id', 'bb2265fb-2e89-474b-a008-867cd95613c0'),
('endpoint_url', 'https://us-south.ml.cloud.ibm.com'),
('api_key', '9C-lT-iAdYzCPPXMoClYy_YK1aD7DLAL9Ajoioaw6gy0'),
('granite33_model', 'ibm/granite-3-3-8b-instruct'),
('granite40_model', 'ibm/granite-4-0-tiny'),
('iam_token', 'hjfhjgfkjgkugukukkiguytdu78r7rfu7f8gi'),
('monitoring_interval', '2'),
('max_packet_capture', '1000'),
('anomaly_threshold', '0.7'),
('auto_analysis', 'true');
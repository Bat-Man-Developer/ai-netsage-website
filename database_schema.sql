-- database.sql

CREATE TABLE api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    api_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE network_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(255),
    mac_address VARCHAR(17) UNIQUE,
    ip_address VARCHAR(45),
    device_type VARCHAR(100),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_traffic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    source_port INT,
    destination_port INT,
    protocol VARCHAR(20),
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES network_devices(id)
);

CREATE TABLE uploaded_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    file_size BIGINT,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

CREATE TABLE analysis_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    model_type ENUM('granite_3_3', 'granite_4_0') NOT NULL,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time DECIMAL(10,3)
);

CREATE TABLE analysis_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT,
    granite_3_3_analysis TEXT,
    granite_4_0_analysis TEXT,
    combined_report TEXT,
    anomalies_detected INT DEFAULT 0,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES uploaded_logs(id)
);

CREATE TABLE network_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type VARCHAR(100),
    severity ENUM('low', 'medium', 'high', 'critical'),
    message TEXT,
    device_id INT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES network_devices(id)
);

-- Insert default API key placeholders
INSERT INTO api_keys (service_name, api_key) VALUES 
('ibm_granite_3_3', ''),
('ibm_granite_4_0', '');
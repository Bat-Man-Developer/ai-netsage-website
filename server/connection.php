<?php
class DatabaseConnection {
    private $host = 'localhost';
    private $dbname = 'ai_netsage';
    private $username = 'root';
    private $password = '';
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage());
            throw new Exception("Query execution failed");
        }
    }

    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    public function fetchOne($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    public function insert($table, $data) {
        $fields = array_keys($data);
        $placeholders = ':' . implode(', :', $fields);
        $sql = "INSERT INTO {$table} (" . implode(', ', $fields) . ") VALUES ({$placeholders})";
        
        return $this->query($sql, $data);
    }

    public function update($table, $data, $where, $whereParams = []) {
        $fields = array_keys($data);
        $set = implode(' = ?, ', $fields) . ' = ?';
        $sql = "UPDATE {$table} SET {$set} WHERE {$where}";
        
        $params = array_merge(array_values($data), $whereParams);
        return $this->query($sql, $params);
    }
}

// Configuration
class Config {
    const API_BASE_URL = '/ai-netsage/server/';
    const GRANITE_33_ENDPOINT = 'http://localhost:8080/granite33';
    const GRANITE_40_ENDPOINT = 'http://localhost:8080/granite40';
    const LOG_RETENTION_DAYS = 30;
    const MAX_LOG_ENTRIES = 1000;
    
    public static function getCorsHeaders() {
        return [
            'Access-Control-Allow-Origin: *',
            'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers: Content-Type, Authorization',
            'Content-Type: application/json'
        ];
    }
}

// Utility functions
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    foreach (Config::getCorsHeaders() as $header) {
        header($header);
    }
    echo json_encode($data);
    exit;
}

function logError($message, $context = []) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'context' => $context
    ];
    error_log(json_encode($logEntry));
}

function validateInput($data, $required = []) {
    $errors = [];
    
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    return $errors;
}
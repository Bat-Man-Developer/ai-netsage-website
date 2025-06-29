<?php
require_once 'connection.php';

class NetworkDataManager
{
    private $db;

    public function __construct()
    {
        $dbConnection = new DatabaseConnection();
        $this->db = $dbConnection->getConnection();
    }

    public function saveNetworkData($data)
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO network_data (source_ip, destination_ip, protocol, source_port, destination_port, packet_length, captured_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            foreach ($data as $packet) {
                $stmt->execute([
                    $packet['source_ip'],
                    $packet['destination_ip'],
                    $packet['protocol'],
                    $packet['source_port'],
                    $packet['destination_port'],
                    $packet['packet_length'],
                    $packet['timestamp']
                ]);
            }

            return ['success' => true, 'message' => 'Network data saved successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to save network data: ' . $e->getMessage()];
        }
    }

    public function getNetworkData($limit = 100, $offset = 0)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM network_data 
                ORDER BY captured_at DESC 
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$limit, $offset]);
            
            $data = $stmt->fetchAll();

            return ['success' => true, 'data' => $data];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to retrieve network data: ' . $e->getMessage()];
        }
    }

    public function getAnomalies()
    {
        try {
            $stmt = $this->db->query("
                SELECT * FROM anomalies 
                ORDER BY detected_at DESC 
                LIMIT 50
            ");
            
            $data = $stmt->fetchAll();

            return ['success' => true, 'data' => $data];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to retrieve anomalies: ' . $e->getMessage()];
        }
    }

    public function saveAnomaly($anomaly)
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO anomalies (anomaly_type, description, severity, source_ip, destination_ip, detected_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $anomaly['type'],
                $anomaly['description'],
                $anomaly['severity'],
                $anomaly['source_ip'],
                $anomaly['destination_ip'],
                $anomaly['timestamp']
            ]);

            return ['success' => true, 'message' => 'Anomaly saved successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to save anomaly: ' . $e->getMessage()];
        }
    }
}
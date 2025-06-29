<?php
require_once 'connection.php';

class ConfigurationManager
{
    private $db;

    public function __construct()
    {
        $dbConnection = new DatabaseConnection();
        $this->db = $dbConnection->getConnection();
    }

    public function saveConfiguration($configs)
    {
        try {
            $stmt = $this->db->prepare("
                UPDATE configurations 
                SET config_value = ?, updated_at = NOW()
                WHERE config_key = ?
            ");

            foreach ($configs as $config) {
                $stmt->execute([$config['value'], $config['id']]);
            }

            return ['success' => true, 'message' => 'Configuration saved successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to save configuration: ' . $e->getMessage()];
        }
    }

    public function getConfiguration()
    {
        try {
            $stmt = $this->db->query("SELECT config_key, config_value FROM configurations");
            $config = [];
            
            while ($row = $stmt->fetch()) {
                $config[$row['config_key']] = $row['config_value'];
            }

            return ['success' => true, 'data' => $config];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to retrieve configuration: ' . $e->getMessage()];
        }
    }
}
<?php
require_once '../config.php';
require_once '../classes/NetworkMonitor.php';

$action = $_GET['action'] ?? '';
$networkMonitor = new NetworkMonitor();

try {
    switch ($action) {
        case 'devices':
            $devices = $networkMonitor->getNetworkDevices();
            sendResponse($devices);
            break;

        case 'traffic':
            $deviceId = $_GET['device_id'] ?? null;
            $traffic = $networkMonitor->getTrafficData($deviceId);
            sendResponse($traffic);
            break;

        case 'start_monitoring':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $result = $networkMonitor->startMonitoring();
                sendResponse($result);
            }
            break;

        case 'stop_monitoring':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $result = $networkMonitor->stopMonitoring();
                sendResponse($result);
            }
            break;

        case 'stats':
            $stats = $networkMonitor->getDashboardStats();
            sendResponse($stats);
            break;

        case 'alerts':
            $alerts = $networkMonitor->getAlerts();
            sendResponse($alerts);
            break;

        default:
            sendError('Invalid action');
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
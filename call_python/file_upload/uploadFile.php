<?php
/**
 * File Upload PHP Interface
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class FileUploadHandler
{
    private $uploadDir = "c:/Xampp/htdocs/ai-netsage-website/uploads/";
    private $allowedExtensions = ['pcap', 'pcapng', 'cap', 'log', 'txt', 'csv', 'json', 'xml'];
    private $maxFileSize = 100 * 1024 * 1024; // 100MB

    public function __construct()
    {
        // Create upload directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function handleUpload()
    {
        if (!isset($_FILES['file'])) {
            return json_encode([
                'success' => false,
                'error' => 'No file uploaded'
            ]);
        }

        $file = $_FILES['file'];
        
        // Validate file
        $validation = $this->validateFile($file);
        if (!$validation['valid']) {
            return json_encode([
                'success' => false,
                'error' => $validation['error']
            ]);
        }

        // Generate unique filename
        $filename = $this->generateUniqueFilename($file['name']);
        $filepath = $this->uploadDir . $filename;

        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return json_encode([
                'success' => true,
                'filename' => $filename,
                'filepath' => $filepath,
                'size' => $file['size'],
                'timestamp' => time()
            ]);
        } else {
            return json_encode([
                'success' => false,
                'error' => 'Failed to save uploaded file'
            ]);
        }
    }

    private function validateFile($file)
    {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'valid' => false,
                'error' => 'Upload error: ' . $this->getUploadErrorMessage($file['error'])
            ];
        }

        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return [
                'valid' => false,
                'error' => 'File too large. Maximum size: ' . ($this->maxFileSize / 1024 / 1024) . 'MB'
            ];
        }

        // Check file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedExtensions)) {
            return [
                'valid' => false,
                'error' => 'Invalid file type. Allowed: ' . implode(', ', $this->allowedExtensions)
            ];
        }

        return ['valid' => true];
    }

    private function generateUniqueFilename($originalName)
    {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $basename = pathinfo($originalName, PATHINFO_FILENAME);
        $timestamp = time();
        $random = substr(md5(uniqid()), 0, 8);
        
        return $basename . '_' . $timestamp . '_' . $random . '.' . $extension;
    }

    private function getUploadErrorMessage($errorCode)
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return 'File exceeds upload_max_filesize directive';
            case UPLOAD_ERR_FORM_SIZE:
                return 'File exceeds MAX_FILE_SIZE directive';
            case UPLOAD_ERR_PARTIAL:
                return 'File was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'File upload stopped by extension';
            default:
                return 'Unknown upload error';
        }
    }
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    $uploadHandler = new FileUploadHandler();
    echo $uploadHandler->handleUpload();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => time()
    ]);
}
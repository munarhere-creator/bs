<?php
session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}
$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';
$flagFile = '../config/registration_closed.flag';
if ($action === 'check') {
    echo json_encode(['status' => 'success', 'is_open' => !file_exists($flagFile)]);
    exit;
}
if ($action === 'open') {
    if (file_exists($flagFile)) {
        unlink($flagFile);
    }
    echo json_encode(['status' => 'success', 'is_open' => true]);
    exit;
}
if ($action === 'close') {
    file_put_contents($flagFile, 'closed');
    echo json_encode(['status' => 'success', 'is_open' => false]);
    exit;
}
echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
?>
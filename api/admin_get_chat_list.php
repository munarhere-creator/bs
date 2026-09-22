<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']); exit;
}

$res = $conn->query("SELECT * FROM chat_sessions ORDER BY last_update DESC");
$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode(['status' => 'success', 'data' => $data]);
?>
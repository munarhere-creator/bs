<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['admin_logged_in']) || empty($_GET['session_id'])) {
    echo json_encode(['status' => 'error']); exit;
}

$session_id = $conn->real_escape_string($_GET['session_id']);

// Reset unread badge admin
$conn->query("UPDATE chat_sessions SET unread_count = 0 WHERE session_id = '$session_id'");

$res = $conn->query("SELECT * FROM chat_messages WHERE session_id = '$session_id' ORDER BY created_at ASC");
$messages = [];
while ($row = $res->fetch_assoc()) {
    // Sisipkan nama admin jika sender adalah admin
    if ($row['sender_type'] === 'admin') {
        $row['message'] = "<strong>(" . htmlspecialchars($row['sender_name']) . ")</strong> " . $row['message'];
    }
    $messages[] = $row;
}

echo json_encode(['status' => 'success', 'messages' => $messages, 'ip_address' => 'Member App']);
?>
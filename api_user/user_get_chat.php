<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['user_logged_in'])) {
    echo json_encode(['status' => 'error']); exit;
}

$user_id = (int)$_SESSION['user_id'];
$session_id = "USER_" . $user_id;

// Reset notif unread user
$conn->query("UPDATE chat_sessions SET unread_user = 0 WHERE session_id = '$session_id'");

$res = $conn->query("SELECT * FROM chat_messages WHERE session_id = '$session_id' ORDER BY created_at ASC");
$messages = [];
while ($row = $res->fetch_assoc()) {
    $messages[] = $row;
}
echo json_encode(['status' => 'success', 'messages' => $messages]);
?>
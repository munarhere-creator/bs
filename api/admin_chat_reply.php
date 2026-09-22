<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']); exit;
}

$data = json_decode(file_get_contents("php://input"));
if (empty($data->session_id) || empty($data->message)) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']); exit;
}

$session_id = $conn->real_escape_string($data->session_id);
$message = $conn->real_escape_string(trim($data->message));
// Ambil nama admin yang sedang login
$admin_name = "Admin " . ucfirst($_SESSION['admin_username']);

$stmt = $conn->prepare("INSERT INTO chat_messages (session_id, sender_type, sender_name, message, created_at) VALUES (?, 'admin', ?, ?, NOW())");
$stmt->bind_param("sss", $session_id, $admin_name, $message);

if ($stmt->execute()) {
    $conn->query("UPDATE chat_sessions SET last_message = '$message', last_sender = 'admin', unread_user = unread_user + 1, last_update = NOW() WHERE session_id = '$session_id'");
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal mengirim']);
}
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['user_logged_in'])) {
    echo json_encode(['status' => 'error', 'message' => 'Silakan login']); exit;
}

$data = json_decode(file_get_contents("php://input"));
if (empty($data->message)) {
    echo json_encode(['status' => 'error']); exit;
}

$user_id = (int)$_SESSION['user_id'];
$session_id = "USER_" . $user_id;
$message = $conn->real_escape_string(trim($data->message));

// Ambil nama user untuk ditampilkan ke admin
$u_query = $conn->query("SELECT nama FROM anggota WHERE id = $user_id");
$user_name = $u_query->fetch_assoc()['nama'] ?? 'Member';

// Cek apakah sesi chat sudah ada
$cek = $conn->query("SELECT session_id FROM chat_sessions WHERE session_id = '$session_id'");
if ($cek->num_rows == 0) {
    $conn->query("INSERT INTO chat_sessions (session_id, user_id, visitor_name, last_message, last_sender, unread_count, last_update) VALUES ('$session_id', $user_id, '$user_name', '$message', 'user', 1, NOW())");
} else {
    $conn->query("UPDATE chat_sessions SET last_message = '$message', last_sender = 'user', unread_count = unread_count + 1, last_update = NOW() WHERE session_id = '$session_id'");
}

$stmt = $conn->prepare("INSERT INTO chat_messages (session_id, sender_type, sender_name, message, created_at) VALUES (?, 'user', ?, ?, NOW())");
$stmt->bind_param("sss", $session_id, $user_name, $message);
$stmt->execute();

echo json_encode(['status' => 'success']);
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

// Proteksi: Hanya Super Admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_role'] !== 'super_admin') {
    echo json_encode(["status" => "error", "message" => "Akses Ditolak."]); 
    exit;
}

// Ambil semua data akun yang rolenya 'admin' biasa
$sql = "SELECT id, username, token FROM admin_users WHERE role = 'admin' ORDER BY id DESC";
$result = $conn->query($sql);

$tokens = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $tokens[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $tokens]);
$conn->close();
?>
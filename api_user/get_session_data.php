<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true) {
    $user_id = (int)$_SESSION['user_id'];
    
    // Tarik data lengkap user
    $stmt = $conn->prepare("SELECT nama, nama_asli, tanggal_lahir, lokasi, whatsapp, no_dana, username_catur, tiktok FROM anggota WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($row = $res->fetch_assoc()) {
        echo json_encode(["status" => "success", "data" => $row]);
        exit;
    }
}
echo json_encode(["status" => "error", "message" => "Not logged in"]);
?>
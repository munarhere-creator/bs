<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

// Verifikasi Super Admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_role'] !== 'super_admin') {
    echo json_encode(["status" => "error", "message" => "Akses Ditolak. Hanya Super Admin yang diizinkan."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->new_admin_username)) {
    $new_username = $conn->real_escape_string($data->new_admin_username);
    
    // Cek apakah username sudah ada
    $stmt_check = $conn->prepare("SELECT id FROM admin_users WHERE username = ?");
    $stmt_check->bind_param("s", $new_username);
    $stmt_check->execute();
    if($stmt_check->get_result()->num_rows > 0){
        echo json_encode(["status" => "error", "message" => "Username sudah digunakan."]);
        exit;
    }
    $stmt_check->close();

    // Buat token random (64 karakter hex)
    $token = bin2hex(random_bytes(32)); 
    
    // Default password hash (bisa diabaikan untuk login berbasis token)
    $dummy_hash = password_hash(bin2hex(random_bytes(10)), PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO admin_users (username, password_hash, role, token) VALUES (?, ?, 'admin', ?)");
    $stmt->bind_param("sss", $new_username, $dummy_hash, $token);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Admin baru berhasil dibuat.", "token" => $token]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal membuat admin."]);
    }
    $stmt->close();
} else {
     echo json_encode(["status" => "error", "message" => "Username admin baru wajib diisi."]);
}

$conn->close();
?>
<?php
session_set_cookie_params(['lifetime' => 0]);
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username_login) && !empty($data->password)) {
    $username_login = $conn->real_escape_string($data->username_login);
    $password = $data->password;

    // Cari user berdasarkan username_login
    $stmt = $conn->prepare("SELECT id, nama, password_hash, status FROM anggota WHERE username_login = ?");
    $stmt->bind_param("s", $username_login);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Opsional: Cek apakah akun aktif atau dibanned
        if ($user['status'] !== 'Aktif') {
             echo json_encode(["status" => "error", "message" => "Akun Anda belum aktif atau sedang ditangguhkan."]);
             $stmt->close();
             $conn->close();
             exit;
        }

        // Verifikasi kecocokan password
        if (password_verify($password, $user['password_hash'])) {
            // Set Session khusus untuk User (agar tidak bentrok dengan session Admin)
            $_SESSION['user_logged_in'] = true;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nama'] = $user['nama'];
            
            echo json_encode([
                "status" => "success", 
                "message" => "Login berhasil!", 
                "nama" => $user['nama']
            ]);
        } else {
             echo json_encode(["status" => "error", "message" => "Password salah."]);
        }
    } else {
         echo json_encode(["status" => "error", "message" => "Username tidak ditemukan."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Mohon berikan username dan password."]);
}
$conn->close();
?>
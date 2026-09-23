<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
require_once '../config/db.php';
if (isset($_SESSION['last_reg_attempt'])) {
    if (time() - $_SESSION['last_reg_attempt'] < 10) {
        echo json_encode(["status" => "error", "message" => "Terlalu banyak permintaan. Tunggu beberapa saat."]);
        exit;
    }
}
$_SESSION['last_reg_attempt'] = time();

$data = json_decode(file_get_contents("php://input"));
if (!empty($data->nama) && !empty($data->username_login) && !empty($data->password) && !empty($data->whatsapp) && !empty($data->no_dana)) {
    $nama = htmlspecialchars(strip_tags(trim($data->nama)), ENT_QUOTES, 'UTF-8');
    $nama_asli = htmlspecialchars(strip_tags(trim($data->nama_asli)), ENT_QUOTES, 'UTF-8');
    $username_login = htmlspecialchars(strip_tags(trim($data->username_login)), ENT_QUOTES, 'UTF-8');
    $email = filter_var(trim($data->email), FILTER_SANITIZE_EMAIL);
    $tanggal_lahir = htmlspecialchars(strip_tags(trim($data->tanggal_lahir)), ENT_QUOTES, 'UTF-8');
    $whatsapp = preg_replace("/[^0-9]/", "", $data->whatsapp); // Hanya menerima angka
    $no_dana = preg_replace("/[^0-9]/", "", $data->no_dana);   // Hanya menerima angka
    $username_catur = htmlspecialchars(strip_tags(trim($data->username_catur)), ENT_QUOTES, 'UTF-8');
    $tiktok = htmlspecialchars(strip_tags(trim($data->tiktok)), ENT_QUOTES, 'UTF-8');
    $lokasi = htmlspecialchars(strip_tags(trim($data->lokasi)), ENT_QUOTES, 'UTF-8');
    $password = $data->password; 
    $jabatan = 'Anggota';
    $status = 'Pending'; // Memerlukan persetujuan Admin
    $stmt_check = $conn->prepare("SELECT id FROM anggota WHERE username_login = ? OR username_catur = ?");
    $stmt_check->bind_param("ss", $username_login, $username_catur);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    if ($result_check->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Username Login atau Username Chess.com sudah terdaftar."]);
        $stmt_check->close();
        $conn->close();
        exit;
    }
    $stmt_check->close();
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO anggota (nama, nama_asli, username_login, password_hash, email, tanggal_lahir, whatsapp, no_dana, username_catur, tiktok, lokasi, jabatan, status, tanggal_daftar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssssssssssss", $nama, $nama_asli, $username_login, $password_hash, $email, $tanggal_lahir, $whatsapp, $no_dana, $username_catur, $tiktok, $lokasi, $jabatan, $status);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Pendaftaran berhasil! Akun Anda sedang direview oleh Admin sebelum dapat digunakan untuk login."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Terjadi kesalahan pada server."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap. Mohon isi semua kolom."]);
}
$conn->close();
?>
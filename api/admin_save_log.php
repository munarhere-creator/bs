<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

// 1. Tolak jika belum login
if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(["status" => "error", "message" => "Akses ditolak."]); 
    exit;
}

$admin_role = $_SESSION['admin_role'] ?? 'admin';
$admin_username = $_SESSION['admin_username'] ?? 'Admin';

// 2. HAK PREROGATIF: Jika Super Admin yang melakukan aksi, batalkan pencatatan log
if ($admin_role === 'super_admin') {
    echo json_encode(["status" => "ignored", "message" => "Aktivitas Super Admin tidak dicatat."]); 
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->message)) {
    $tipe = $conn->real_escape_string($data->type ?? 'general');
    $pesan_mentah = $conn->real_escape_string($data->message);
    
    // 3. RAKIT PESAN (Contoh: "Admin Runa" + "menghapus anggota Budi")
    $pesan_lengkap = "Admin " . $admin_username . " " . $pesan_mentah;
    
    // 4. Simpan ke database
    $sql = "INSERT INTO log_aktivitas (admin_username, admin_role, tipe, pesan) 
            VALUES ('$admin_username', '$admin_role', '$tipe', '$pesan_lengkap')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan log: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Pesan aktivitas kosong."]);
}

$conn->close();
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
require_once '../config/db.php';

// Hapus 'alamat' dari baris SELECT di bawah ini
$sql = "SELECT id, nama, nama_asli, tanggal_lahir, lokasi, jabatan, rating, status, foto, username_catur, tiktok, seputar_saya FROM anggota WHERE status = 'Aktif' ORDER BY rating DESC";
$result = $conn->query($sql);

$members = [];

if ($result) {
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['rating'] = (int)$row['rating']; 
            $members[] = $row;
        }
    }
    echo json_encode([
        "status" => "success", 
        "data" => $members
    ]);
} else {
    // Jika kolom tidak ditemukan, munculkan pesan error MySQL dalam format JSON
    echo json_encode([
        "status" => "error", 
        "message" => "Database Error: " . $conn->error
    ]);
}

$conn->close();
?>
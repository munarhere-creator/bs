<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
require_once '../config/db.php';

$sql = "SELECT id, nama, nama_asli, tanggal_lahir, lokasi, email, whatsapp, username_catur, motivasi, tiktok, seputar_saya, jabatan, status, tanggal_daftar
        FROM anggota
        WHERE status = 'Pending'
        ORDER BY tanggal_daftar DESC";
$result = $conn->query($sql);

$members = [];

if ($result) {
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $members[] = $row;
        }
    }
    echo json_encode([
        "status" => "success", 
        "data" => $members
    ]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Database Error: " . $conn->error
    ]);
}

$conn->close();
?>
<?php
// File: api/admin_get_belum_daftar_ulang.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

// 1. FIX PATH: Mengarah ke folder config
require_once '../config/db.php'; 

try {
    // 2 & 3. FIX QUERY: Sesuaikan nama tabel dan kolom relasi (username_catur)
    $sql = "
        SELECT 
            A.id, 
            A.nama, 
            A.username_catur, 
            A.whatsapp,
            A.tanggal_daftar 
        FROM anggota A
        LEFT JOIN pendaftaran_ulang D ON LOWER(A.username_catur) = LOWER(D.username_catur) 
        WHERE D.id IS NULL 
        AND A.status = 'Aktif' 
        ORDER BY A.nama ASC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query gagal dijalankan: " . $conn->error);
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Data member yang belum daftar ulang berhasil diambil.",
        "count" => count($data),
        "data" => $data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Terjadi kesalahan pada server: " . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$identifier = $input['identifier'] ?? '';

if (empty($identifier)) {
    echo json_encode(['status' => 'error', 'message' => 'Identifier kosong']);
    exit;
}

$identifier = $conn->real_escape_string($identifier);

// Cari data historis turnamen berdasarkan Username Catur, WA, atau DANA
$sql = "SELECT nama, nama_asli, domisili, whatsapp, no_dana, username_catur, tiktok 
        FROM pendaftar_turnamen 
        WHERE LOWER(username_catur) = LOWER('$identifier') 
           OR whatsapp = '$identifier' 
           OR no_dana = '$identifier' 
        ORDER BY id DESC LIMIT 1";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $data = $result->fetch_assoc();
    echo json_encode(['status' => 'success', 'data' => $data]);
} else {
    echo json_encode(['status' => 'not_found', 'message' => 'Belum pernah daftar']);
}
$conn->close();
?>
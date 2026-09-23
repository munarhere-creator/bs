<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['user_logged_in'])) {
    echo json_encode(['status' => 'error']); exit;
}

$user_id = (int)$_SESSION['user_id'];
// Mengambil semua member aktif kecuali diri sendiri
$sql = "SELECT id, nama, username_catur, avatar, jabatan FROM anggota WHERE status = 'Aktif' AND id != $user_id ORDER BY nama ASC";
$res = $conn->query($sql);

$members = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $members[] = $row;
    }
}
echo json_encode(['status' => 'success', 'data' => $members]);
?>
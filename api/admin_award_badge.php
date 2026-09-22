<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak.']);
    exit;
}

$headers = apache_request_headers();
$csrf_token = $headers['X-CSRF-Token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
if (empty($csrf_token) || $csrf_token !== $_SESSION['csrf_token']) {
    echo json_encode(['status' => 'error', 'message' => 'Validasi keamanan (CSRF) gagal. Silakan refresh halaman.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$anggota_id = (int)($data['anggota_id'] ?? 0);
$tipe_lencana = trim($data['tipe_lencana'] ?? '');
$keterangan = trim($data['keterangan'] ?? ''); // Khusus untuk nama turnamen

if ($anggota_id === 0 || empty($tipe_lencana)) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap.']);
    exit;
}

$keterangan_aman = htmlspecialchars($keterangan, ENT_QUOTES, 'UTF-8');

$stmt = $conn->prepare("INSERT INTO member_lencana (anggota_id, tipe_lencana, keterangan, tanggal_diberikan) VALUES (?, ?, ?, NOW())");
$stmt->bind_param("iss", $anggota_id, $tipe_lencana, $keterangan_aman);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Lencana berhasil diberikan']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan ke database']);
}
$stmt->close();
?>
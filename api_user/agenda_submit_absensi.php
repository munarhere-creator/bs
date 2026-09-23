<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';
$time_now = time();
if (isset($_SESSION['last_submit']) && ($time_now - $_SESSION['last_submit']) < 5) {
    echo json_encode(['status' => 'error', 'message' => 'Terlalu banyak permintaan. Tunggu 5 detik.']);
    exit;
}
$_SESSION['last_submit'] = $time_now;
if (!isset($_SESSION['user_logged_in']) || empty($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak.']);
    exit;
}
$agenda_id = filter_input(INPUT_POST, 'agenda_id', FILTER_SANITIZE_NUMBER_INT);
$status = htmlspecialchars(strip_tags($_POST['status_kehadiran'] ?? ''), ENT_QUOTES, 'UTF-8');
$anggota_id = $_SESSION['user_id']; 
$allowed_status = ['Ikut', 'Tidak', 'Mungkin'];
if (!in_array($status, $allowed_status)) {
    echo json_encode(['status' => 'error', 'message' => 'Status tidak valid.']);
    exit;
}
$stmt_check = $conn->prepare("SELECT id FROM absensi_agenda WHERE agenda_id = ? AND anggota_id = ?");
$stmt_check->bind_param("ii", $agenda_id, $anggota_id);
$stmt_check->execute();
$res_check = $stmt_check->get_result();
if ($res_check->num_rows > 0) {
    $stmt_up = $conn->prepare("UPDATE absensi_agenda SET status_kehadiran = ? WHERE agenda_id = ? AND anggota_id = ?");
    $stmt_up->bind_param("sii", $status, $agenda_id, $anggota_id);
    $stmt_up->execute();
} else {
    $stmt_in = $conn->prepare("INSERT INTO absensi_agenda (agenda_id, anggota_id, status_kehadiran) VALUES (?, ?, ?)");
    $stmt_in->bind_param("iis", $agenda_id, $anggota_id, $status);
    $stmt_in->execute();
}

echo json_encode(['status' => 'success', 'message' => 'Absensi berhasil disimpan!']);
?>
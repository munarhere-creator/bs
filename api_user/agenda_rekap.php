<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';
if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak.']);
    exit;
}
$agenda_id = filter_input(INPUT_GET, 'agenda_id', FILTER_SANITIZE_NUMBER_INT);

if (!$agenda_id) {
    echo json_encode(['status' => 'error', 'message' => 'ID Agenda diperlukan.']);
    exit;
}
$stmt = $conn->prepare("
    SELECT ag.nama, ag.jabatan, aa.status_kehadiran, aa.waktu_update 
    FROM absensi_agenda aa 
    JOIN anggota ag ON aa.anggota_id = ag.id 
    WHERE aa.agenda_id = ? 
    ORDER BY aa.waktu_update DESC
");
$stmt->bind_param("i", $agenda_id);
$stmt->execute();
$result = $stmt->get_result();

$data_rekap = [];
while ($row = $result->fetch_assoc()) {
    $row['nama'] = htmlspecialchars($row['nama'], ENT_QUOTES, 'UTF-8');
    $data_rekap[] = $row;
}
echo json_encode(['status' => 'success', 'data' => $data_rekap]);
?>
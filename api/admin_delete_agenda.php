<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']); exit;
}

$data = json_decode(file_get_contents("php://input"));
if (empty($data->id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID tidak valid']); exit;
}

$id = (int)$data->id;
if ($conn->query("DELETE FROM agenda_kegiatan WHERE id=$id")) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menghapus agenda']);
}
?>
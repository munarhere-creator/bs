<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']); exit;
}

$data = json_decode(file_get_contents("php://input"));
if (empty($data->judul) || empty($data->tanggal)) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']); exit;
}

$judul = $conn->real_escape_string($data->judul);
$tanggal = $conn->real_escape_string($data->tanggal);
$waktu = $conn->real_escape_string($data->waktu);
$tipe = $conn->real_escape_string($data->tipe);
$lokasi = $conn->real_escape_string($data->lokasi);
$deskripsi = $conn->real_escape_string($data->deskripsi ?? '');
$cp = $conn->real_escape_string($data->cp ?? '');

if (!empty($data->id)) {
    // Mode Update
    $id = (int)$data->id;
    $sql = "UPDATE agenda_kegiatan SET judul='$judul', tanggal='$tanggal', waktu='$waktu', tipe='$tipe', lokasi='$lokasi', deskripsi='$deskripsi', cp='$cp' WHERE id=$id";
} else {
    // Mode Insert
    $sql = "INSERT INTO agenda_kegiatan (judul, tanggal, waktu, tipe, lokasi, deskripsi, cp) VALUES ('$judul', '$tanggal', '$waktu', '$tipe', '$lokasi', '$deskripsi', '$cp')";
}

if ($conn->query($sql)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan agenda']);
}
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['user_logged_in'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']); exit;
}

$data = json_decode(file_get_contents("php://input"));
$user_id = (int)$_SESSION['user_id'];
$avatar = $conn->real_escape_string($data->avatar ?? 'avatar1.png');
$seputar = $conn->real_escape_string($data->seputar_saya ?? '');
$uname_catur = $conn->real_escape_string($data->username_catur ?? '');

$sql = "UPDATE anggota SET avatar = '$avatar', seputar_saya = '$seputar', username_catur = '$uname_catur' WHERE id = $user_id";

if ($conn->query($sql)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan profil']);
}
?>
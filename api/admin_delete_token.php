<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_role'] !== 'super_admin') {
    echo json_encode(["status" => "error", "message" => "Akses Ditolak."]); 
    exit;
}
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
    $id = (int)$data->id;
    $sql = "DELETE FROM admin_users WHERE id = $id AND role = 'admin'";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menghapus token."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID tidak valid."]);
}
$conn->close();
?>
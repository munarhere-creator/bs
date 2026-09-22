<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id)) {
    $id = (int)$data->id;
    $sql = "DELETE FROM pendaftar_turnamen WHERE id=$id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID tidak ditemukan"]);
}
$conn->close();
?>
<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nama) && !empty($data->pesan)) {
    $nama = $conn->real_escape_string($data->nama);
    $pesan = $conn->real_escape_string($data->pesan);
    
    $sql = "INSERT INTO kritik_saran (nama, pesan, tanggal) VALUES ('$nama', '$pesan', NOW())";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Nama dan Pesan wajib diisi."]);
}
$conn->close();
?>
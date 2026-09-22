<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->judul) && !empty($data->tanggal)) {
    $id = isset($data->id) ? (int)$data->id : 0;
    
    $judul = $conn->real_escape_string($data->judul);
    $tanggal = $conn->real_escape_string($data->tanggal);
    $waktu = $conn->real_escape_string($data->waktu);
    $mode = $conn->real_escape_string($data->mode);
    $slot = $conn->real_escape_string($data->slot);
    $rating_min = isset($data->rating_min) ? (int)$data->rating_min : 0;
    $rating_max = isset($data->rating_max) ? (int)$data->rating_max : 3000;
    $status = $conn->real_escape_string($data->status); 
    $deskripsi = $conn->real_escape_string($data->deskripsi);
    $link_turnamen = isset($data->link_turnamen) ? $conn->real_escape_string($data->link_turnamen) : '';

    if ($id > 0) {
        $sql = "UPDATE turnamen SET 
                tanggal='$tanggal', judul='$judul', deskripsi='$deskripsi', waktu='$waktu', 
                mode='$mode', slot='$slot', rating_min=$rating_min, rating_max=$rating_max, 
                status='$status', link_turnamen='$link_turnamen' 
                WHERE id=$id";
    } else {
        $sql = "INSERT INTO turnamen (tanggal, judul, deskripsi, waktu, mode, slot, rating_min, rating_max, status, link_turnamen) 
                VALUES ('$tanggal', '$judul', '$deskripsi', '$waktu', '$mode', '$slot', $rating_min, $rating_max, '$status', '$link_turnamen')";
    }

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
}
$conn->close();
?>
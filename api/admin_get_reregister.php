<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$sql = "SELECT * FROM pendaftaran_ulang ORDER BY waktu_submit DESC";
$result = $conn->query($sql);
$data = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $data]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
$conn->close();
?>
<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$sql = "SELECT * FROM kritik_saran ORDER BY tanggal DESC";
$result = $conn->query($sql);

$feedbacks = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $feedbacks[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $feedbacks]);
$conn->close();
?>
<?php
header('Content-Type: application/json');
require_once '../config/db.php';
$sql = "SELECT * FROM anggota ORDER BY id DESC";
$result = $conn->query($sql);
$members = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $members[] = $row;
    }
}
echo json_encode([
    "status" => "success",
    "data" => $members
]);
$conn->close();
?>
<?php
header('Content-Type: application/json');
require_once '../config/db.php';
$event_id = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
$status_filter = isset($_GET['status']) ? $conn->real_escape_string($_GET['status']) : '';
if ($event_id > 0) {
    $sql = "SELECT * FROM pendaftar_turnamen WHERE turnamen_id = $event_id";
    if ($status_filter !== '') {
        $sql .= " AND status = '$status_filter'";
    }
    $sql .= " ORDER BY waktu_daftar ASC";
    $result = $conn->query($sql);
    $peserta = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $peserta[] = $row;}}
    echo json_encode(["status" => "success", "data" => $peserta]);
} else {
    echo json_encode(["status" => "error", "message" => "ID Turnamen tidak valid."]);
}
$conn->close();
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(["status" => "error"]); exit;
}

// Ambil 15 aktivitas terbaru
$sql = "SELECT * FROM log_aktivitas ORDER BY waktu DESC LIMIT 15";
$result = $conn->query($sql);
$logs = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $logs[] = [
            'type' => $row['tipe'],
            'message' => $row['pesan'],
            'timestamp' => $row['waktu']
        ];
    }
}
echo json_encode(["status" => "success", "data" => $logs]);
$conn->close();
?>
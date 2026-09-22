<?php
header('Content-Type: application/json');
require_once '../config/db.php';

// Cek apakah request datang dari panel admin
$isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';

if ($isAdmin) {
    // Admin melihat SEMUA turnamen (termasuk yang diarsipkan), diurutkan dari yang terbaru
    $sql = "SELECT * FROM turnamen ORDER BY tanggal DESC";
} else {
    // Web utama HANYA melihat turnamen yang statusnya BUKAN 'Arsip'
    $sql = "SELECT * FROM turnamen WHERE status != 'Arsip' ORDER BY tanggal ASC";
}

$result = $conn->query($sql);
$events = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $events]);
$conn->close();
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';
$time_now = time();
if (isset($_SESSION['last_req_ebooks']) && ($time_now - $_SESSION['last_req_ebooks'] < 1)) {
    http_response_code(429);
    die(json_encode(["status" => "error", "message" => "Terlalu banyak permintaan (Spam Detected)."]));
}
$_SESSION['last_req_ebooks'] = $time_now;
$stmt = $conn->prepare("SELECT * FROM ebooks ORDER BY id DESC");
$stmt->execute();
$result = $stmt->get_result();
$ebooks = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['file_pdf'] = 'api/verify_ebook.php?id=' . $row['id'];
        $ebooks[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $ebooks]);
$stmt->close();
$conn->close();
?>
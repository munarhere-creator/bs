<?php
session_start();
require_once '../config/db.php';
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
    http_response_code(403);
    die("Akses Ditolak: Anda harus Login sebagai Member untuk mengunduh E-Book.");
}
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    die("Bad Request: ID E-Book tidak valid.");
}
$id = intval($_GET['id']);
$stmt = $conn->prepare("SELECT file_pdf FROM ebooks WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    die("E-Book tidak ditemukan di database.");
}
$row = $result->fetch_assoc();
$file_path = '../' . $row['file_pdf'];
$stmt->close();
$conn->close();
if (!file_exists($file_path)) {
    http_response_code(404);
    die("File fisik PDF tidak ditemukan di server.");
}
$file_name = basename($file_path); 
header('Content-Description: File Transfer');
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '"'); 
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($file_path));
ob_clean(); 
flush();
readfile($file_path);
exit;
?>
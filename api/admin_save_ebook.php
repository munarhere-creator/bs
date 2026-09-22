<?php
header('Content-Type: application/json');
require_once '../config/db.php';

// Siapkan folder penyimpanan file di server
$uploadDir = '../uploads/ebooks/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$judul = $conn->real_escape_string($_POST['judul']);
$penulis = $conn->real_escape_string($_POST['penulis']);
$kategori = $conn->real_escape_string($_POST['kategori']);
$deskripsi = $conn->real_escape_string($_POST['deskripsi']);

$coverPath = '';
$pdfPath = '';

// Proses Upload Gambar Cover
if(isset($_FILES['cover']) && $_FILES['cover']['error'] == 0){
    $ext = pathinfo($_FILES['cover']['name'], PATHINFO_EXTENSION);
    $coverName = 'cover_' . uniqid() . '.' . $ext;
    move_uploaded_file($_FILES['cover']['tmp_name'], $uploadDir . $coverName);
    $coverPath = 'uploads/ebooks/' . $coverName;
}

// Proses Upload File PDF
if(isset($_FILES['file']) && $_FILES['file']['error'] == 0){
    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $pdfName = 'pdf_' . uniqid() . '.' . $ext;
    move_uploaded_file($_FILES['file']['tmp_name'], $uploadDir . $pdfName);
    $pdfPath = 'uploads/ebooks/' . $pdfName;
}

if($coverPath == '' || $pdfPath == ''){
    echo json_encode(["status" => "error", "message" => "File Cover dan PDF wajib diunggah."]);
    exit;
}

$sql = "INSERT INTO ebooks (judul, penulis, kategori, deskripsi, cover, file_pdf, tanggal_upload) 
        VALUES ('$judul', '$penulis', '$kategori', '$deskripsi', '$coverPath', '$pdfPath', NOW())";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
$conn->close();
?>
<?php
session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
    echo json_encode(['status' => 'error', 'message' => 'Sesi berakhir, silakan login ulang.']);
    exit;
}
require_once '../config/db.php';
$user_id = (int) $_SESSION['user_id'];
$judul = trim($_POST['judul'] ?? '');
$kategori = trim($_POST['kategori'] ?? '');
$konten = trim($_POST['konten'] ?? '');
if (empty($judul) || empty($kategori) || empty($konten)) {
    echo json_encode(['status' => 'error', 'message' => 'Data wajib (Judul, Kategori, Konten) tidak boleh kosong.']);
    exit;
}
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $judul), '-'));
$slug .= '-' . time();
$cover_name = null;
if (isset($_FILES['cover']) && $_FILES['cover']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['cover']['tmp_name'];
    $file_name = $_FILES['cover']['name'];
    $file_size = $_FILES['cover']['size'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    $allowed_ext = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($file_ext, $allowed_ext)) {
        echo json_encode(['status' => 'error', 'message' => 'Format gambar cover tidak valid (hanya JPG, PNG, WEBP).']);
        exit;
    }
    if ($file_size > 2 * 1024 * 1024) {
        echo json_encode(['status' => 'error', 'message' => 'Ukuran gambar cover maksimal 2MB.']);
        exit;
    }
    $upload_dir = '../assets/blog_covers/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true); 
    }

    $cover_name = uniqid('cover_') . '.' . $file_ext;
    
    if (!move_uploaded_file($file_tmp, $upload_dir . $cover_name)) {
        echo json_encode(['status' => 'error', 'message' => 'Gagal mengunggah gambar cover.']);
        exit;
    }
}
$stmt = $conn->prepare("INSERT INTO blog_posts (anggota_id, judul, slug, kategori, cover_image, konten) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isssss", $user_id, $judul, $slug, $kategori, $cover_name, $konten);
if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Artikel berhasil dipublikasikan!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan ke database.']);
}
$stmt->close();
$conn->close();
?>
<?php
header('Content-Type: application/json');
require_once '../config/db.php';
$sql = "SELECT b.id, b.judul, b.slug, b.kategori, b.cover_image, b.konten, b.tanggal_dibuat, a.nama AS penulis 
        FROM blog_posts b 
        JOIN anggota a ON b.anggota_id = a.id 
        ORDER BY b.tanggal_dibuat DESC";
$result = $conn->query($sql);
$blogs = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $blogs[] = $row;
    }
}
echo json_encode([
    'status' => 'success',
    'data' => $blogs
]);

$conn->close();
?>
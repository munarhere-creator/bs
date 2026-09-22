<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
require_once '../config/db.php';

// Otomatis membuat tabel pendaftaran_ulang jika belum ada
$table_sql = "CREATE TABLE IF NOT EXISTS pendaftaran_ulang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(255),
    tiktok VARCHAR(100),
    username_catur VARCHAR(100),
    whatsapp VARCHAR(20),
    dana VARCHAR(20),
    rating_rapid INT DEFAULT 0,
    rating_blitz INT DEFAULT 0,
    rating_bullet INT DEFAULT 0,
    waktu_submit DATETIME DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($table_sql);

$data = json_decode(file_get_contents("php://input"));

if (isset($data->chessUsername) && isset($data->wa)) {
    $username_catur = $conn->real_escape_string(trim($data->chessUsername));
    $whatsapp = $conn->real_escape_string(trim($data->wa));
    
    // Cerdik: Ambil angka intinya saja agar pencocokan WA (+62 / 08 / 62) akurat
    $wa_clean = preg_replace('/[^0-9]/', '', $whatsapp);
    if (substr($wa_clean, 0, 2) === '62') {
        $wa_core = substr($wa_clean, 2);
    } elseif (substr($wa_clean, 0, 1) === '0') {
        $wa_core = substr($wa_clean, 1);
    } else {
        $wa_core = $wa_clean;
    }
    
    // Cek apakah username dan WA cocok dengan data di tabel anggota
    // Menggunakan prepared statement untuk keamanan ekstra
    $stmt = $conn->prepare("SELECT id FROM anggota WHERE LOWER(username_catur) = LOWER(?) AND whatsapp LIKE ?");
    $wa_like = "%" . $wa_core;
    $stmt->bind_param("ss", $username_catur, $wa_like);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Data Cocok! Masukkan ke tabel pendaftaran_ulang
        $nama_lengkap = $conn->real_escape_string($data->fullName);
        $tiktok = $conn->real_escape_string($data->tiktok);
        $dana = $conn->real_escape_string($data->dana);
        $rapid = isset($data->rating->rapid) ? (int)$data->rating->rapid : 0;
        $blitz = isset($data->rating->blitz) ? (int)$data->rating->blitz : 0;
        $bullet = isset($data->rating->bullet) ? (int)$data->rating->bullet : 0;

        $insert = $conn->prepare("INSERT INTO pendaftaran_ulang (nama_lengkap, tiktok, username_catur, whatsapp, dana, rating_rapid, rating_blitz, rating_bullet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->bind_param("sssssiii", $nama_lengkap, $tiktok, $username_catur, $whatsapp, $dana, $rapid, $blitz, $bullet);
        
        if ($insert->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Terjadi kesalahan server saat menyimpan data."]);
        }
    } else {
        // Data TIDAK Cocok (Username salah atau WA salah) -> Tolak!
        echo json_encode(["status" => "error", "message" => "Data salah, cek ulang kembali"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
}
$conn->close();
?>
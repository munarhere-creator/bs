<?php
// Matikan error HTML agar tidak merusak format JSON ke JavaScript
error_reporting(0); 
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data || empty($data->event_id) || empty($data->peserta_id) || empty($data->juara)) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
    exit;
}

$eventId = (int)$data->event_id;
$pesertaId = (int)$data->peserta_id;
$juara = (int)$data->juara;

// 1. Ambil data turnamen & peserta
$qEvent = $conn->query("SELECT judul FROM turnamen WHERE id = $eventId");
$event = $qEvent->fetch_assoc();

$qPeserta = $conn->query("SELECT nama, whatsapp FROM pendaftar_turnamen WHERE id = $pesertaId");
$peserta = $qPeserta->fetch_assoc();

if (!$event || !$peserta) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak ditemukan di database']);
    exit;
}

// Pengecekan GD Library
if (!function_exists('imagecreatefrompng')) {
    echo json_encode(['status' => 'error', 'message' => 'Ekstensi GD Library PHP belum aktif!']);
    exit;
}

// 2. Persiapkan Kanvas dan Font (GUNAKAN ABSOLUTE PATH DENGAN __DIR__)
$canvasPath = __DIR__ . "/../assets/kanvas_juara_{$juara}.png";
if (!file_exists($canvasPath)) {
    $canvasPath = __DIR__ . "/../assets/kanvas_sertifikat.png"; 
}

// Pastikan file kanvas benar-benar ada
if (!file_exists($canvasPath)) {
    echo json_encode(['status' => 'error', 'message' => 'File kanvas_sertifikat.png tidak ditemukan!']);
    exit;
}

$fontPoppins = __DIR__ . "/../assets/fonts/Poppins-Regular.ttf";
$fontScript = __DIR__ . "/../assets/fonts/Aston Script.ttf";

// Pastikan font benar-benar ada
if(!file_exists($fontPoppins) || !file_exists($fontScript)) {
    echo json_encode(['status' => 'error', 'message' => 'File Font TTF tidak ditemukan di folder assets/fonts/']);
    exit;
}

try {
    // 3. Proses Menggambar
    $image = imagecreatefrompng($canvasPath);
    if (!$image) {
        echo json_encode(['status' => 'error', 'message' => 'Gagal membaca file PNG kanvas. Pastikan gambar valid.']);
        exit;
    }

    $colorWhite = imagecolorallocate($image, 255, 255, 255);
    $colorGold  = imagecolorallocate($image, 218, 165, 32); // tersedia kalau mau nama pakai warna emas

    $imgWidth  = imagesx($image);
    $imgHeight = imagesy($image);
    $tanggal = date('d F Y');

    // Menggambar teks center-align di titik ($centerX, $y=baseline), dengan ukuran font
    // otomatis mengecil kalau teksnya kepanjangan supaya tidak keluar area / nabrak logo.
    function printFitCenteredText($img, $baseSize, $minSize, $centerX, $y, $maxWidth, $color, $font, $text) {
        $size = $baseSize;
        do {
            $bbox = imagettfbbox($size, 0, $font, $text);
            $textWidth = $bbox[2] - $bbox[0];
            if ($textWidth <= $maxWidth || $size <= $minSize) break;
            $size--;
        } while ($size > $minSize);

        $x = $centerX - ($textWidth / 2);
        imagettftext($img, $size, 0, $x, $y, $color, $font, $text);
    }

    // Semua koordinat berikut adalah PERSENTASE dari lebar/tinggi kanvas asli
    // (diukur dari file kanvas_juara_2.png rasio ~16:9, area teks memang tidak
    // simetris di tengah kanvas karena logo besar menempel di sisi kiri).

    // 1) Nama pemenang -> menggantikan "Nama Pemenang"
    printFitCenteredText(
        $image, round($imgHeight * 0.122), 40,
        $imgWidth * 0.656, $imgHeight * 0.487,
        $imgWidth * 0.50,
        $colorWhite, $fontScript, $peserta['nama']
    );

    // 2) Baris keterangan kecil -> menggantikan "Atas Prestasinya Meraih Juara 2 pada"
    printFitCenteredText(
        $image, round($imgHeight * 0.017), 12,
        $imgWidth * 0.652, $imgHeight * 0.563,
        $imgWidth * 0.60,
        $colorWhite, $fontPoppins, "Atas Prestasinya Meraih Juara $juara pada"
    );

    // 3) Nama turnamen (bold) -> menggantikan "Nama Turnamen"
    printFitCenteredText(
        $image, round($imgHeight * 0.043), 16,
        $imgWidth * 0.656, $imgHeight * 0.612,
        $imgWidth * 0.50,
        $colorWhite, $fontPoppins, $event['judul']
    );

    // 4) Tanggal -> menggantikan tulisan "Tanggal" di dekat ikon kalender (pojok kiri bawah)
    printFitCenteredText(
        $image, round($imgHeight * 0.01), 10,
        $imgWidth * 0.516, $imgHeight * 0.871,
        $imgWidth * 0.28,
        $colorWhite, $fontPoppins, $tanggal
    );

    // 4. Simpan Gambar
    $dir = __DIR__ . "/../uploads/sertifikat/";
    if (!is_dir($dir)) mkdir($dir, 0777, true);

    $cleanName = preg_replace('/[^A-Za-z0-9\-]/', '_', $peserta['nama']);
    $fileName = "Sertifikat_Juara{$juara}_{$eventId}_{$cleanName}.png";
    $savePath = $dir . $fileName;

    imagepng($image, $savePath);
    imagedestroy($image);

    // 5. Kembalikan URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $domain = $_SERVER['HTTP_HOST'];
    $publicUrl = $protocol . "://" . $domain . "/uploads/sertifikat/" . $fileName;

    echo json_encode([
        'status' => 'success',
        'wa' => $peserta['whatsapp'],
        'nama' => $peserta['nama'],
        'url' => $publicUrl
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Sistem Error: ' . $e->getMessage()]);
}

$conn->close();
?>
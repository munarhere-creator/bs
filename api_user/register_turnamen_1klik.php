<?php
session_start();
header('Content-Type: application/json');

// 1. Cek Sesi Login User
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true || !isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak. Silakan login terlebih dahulu.']);
    exit;
}

// 2. Proteksi Dasar Rate Limiting / Anti-Spam (Anti-DDoS sederhana per session)
if (!isset($_SESSION['last_reg_click'])) {
    $_SESSION['last_reg_click'] = 0;
}
if (time() - $_SESSION['last_reg_click'] < 2) {
    echo json_encode(['status' => 'error', 'message' => 'Terlalu cepat. Harap tunggu sebentar sebelum mencoba lagi.']);
    exit;
}
$_SESSION['last_reg_click'] = time();

require_once '../config/db.php';

$user_id = (int) $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);
$turnamen_id = isset($input['event_id']) ? (int) $input['event_id'] : 0;

if ($turnamen_id <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'ID Turnamen tidak valid.']);
    exit;
}

try {
    // 3. Ambil Data User (Status, Username Catur, dll) menggunakan Prepared Statement (Anti SQL Injection)
    $stmt_user = $conn->prepare("SELECT id, nama, username_catur, status FROM anggota WHERE id = ?");
    $stmt_user->bind_param("i", $user_id);
    $stmt_user->execute();
    $user_data = $stmt_user->get_result()->fetch_assoc();
    $stmt_user->close();

    if (!$user_data || $user_data['status'] !== 'Aktif') {
        echo json_encode(['status' => 'error', 'message' => 'Akun Anda belum aktif atau tidak ditemukan.']);
        exit;
    }

    // 4. Ambil Data Turnamen
    $stmt_t = $conn->prepare("SELECT id, judul, tanggal, status, slot, rating_min, rating_max FROM turnamen WHERE id = ?");
    $stmt_t->bind_param("i", $turnamen_id);
    $stmt_t->execute();
    $turnamen = $stmt_t->get_result()->fetch_assoc();
    $stmt_t->close();

    if (!$turnamen) {
        echo json_encode(['status' => 'error', 'message' => 'Turnamen tidak ditemukan.']);
        exit;
    }

    // A. Cek Status Turnamen / Tanggal Lewat
    $today_date = new DateTime();
    $turnamen_date = new DateTime($turnamen['tanggal']);
    
    if ($turnamen['status'] === 'arsip' || $turnamen_date < $today_date->setTime(0,0,0)) {
        echo json_encode(['status' => 'error', 'message' => 'Turnamen ini sudah ditutup atau tanggalnya sudah terlewat.']);
        exit;
    }

    // B. Cek Apakah Sudah Pernah Daftar
    $stmt_check = $conn->prepare("SELECT id FROM pendaftar_turnamen WHERE turnamen_id = ? AND (anggota_id = ? OR username_catur = ?)");
    $stmt_check->bind_param("iis", $turnamen_id, $user_id, $user_data['username_catur']);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Anda sudah terdaftar di turnamen ini.']);
        exit;
    }
    $stmt_check->close();

    // C. Cek Kapasitas Slot
    $stmt_slot = $conn->prepare("SELECT COUNT(id) as total FROM pendaftar_turnamen WHERE turnamen_id = ?");
    $stmt_slot->bind_param("i", $turnamen_id);
    $stmt_slot->execute();
    $total_peserta = $stmt_slot->get_result()->fetch_assoc()['total'] ?? 0;
    $stmt_slot->close();

    // Ekstrak angka slot dari string misal "32 slot" -> 32
    preg_match('/\d+/', $turnamen['slot'], $matches);
    $max_slot = isset($matches[0]) ? (int) $matches[0] : 999;

    if ($total_peserta >= $max_slot) {
        echo json_encode(['status' => 'error', 'message' => 'Maaf, slot peserta turnamen ini sudah penuh.']);
        exit;
    }

    // D. Cek Syarat Rating (Ambil data dari Chess.com publik API jika username ada)
    $user_rating = 0;
    $username_catur = trim($user_data['username_catur']);
    if (!empty($username_catur)) {
        $ch = curl_init("https://api.chess.com/pub/player/" . strtolower($username_catur) . "/stats");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $stats = json_decode($response, true);
            $rapid = $stats['chess_rapid']['last']['rating'] ?? 0;
            $blitz = $stats['chess_blitz']['last']['rating'] ?? 0;
            $user_rating = max($rapid, $blitz); // Ambil nilai tertinggi antara rapid/blitz
        }
    }

    $min_req = (int) ($turnamen['rating_min'] ?? 0);
    $max_req = (int) ($turnamen['rating_max'] ?? 3000);

    // Jika user punya rating dan batas min/max diatur
    if ($user_rating > 0 && ($user_rating < $min_req || $user_rating > $max_req)) {
        echo json_encode(['status' => 'error', 'message' => "Rating Anda ($user_rating) tidak memenuhi syarat turnamen ($min_req - $max_req)."]);
        exit;
    }

    // 5. Masukkan ke Database (Pendaftaran Berhasil)
    $stmt_ins = $conn->prepare("INSERT INTO pendaftar_turnamen (turnamen_id, anggota_id, nama, username_catur, status, waktu_daftar) VALUES (?, ?, ?, ?, 'Disetujui', NOW())");
    $stmt_ins->bind_param("iiss", $turnamen_id, $user_id, $user_data['nama'], $username_catur);
    
    if ($stmt_ins->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Pendaftaran berhasil!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memproses pendaftaran ke database.']);
    }
    $stmt_ins->close();

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Terjadi kesalahan pada server.']);
}
?>
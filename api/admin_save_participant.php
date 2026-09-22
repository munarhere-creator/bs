<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_role'] !== 'super_admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Hanya Super Admin yang diizinkan.']);
    exit;
}
$data = json_decode(file_get_contents("php://input"));
if (empty($data->turnamen_id) || empty($data->nama) || empty($data->username_catur) || empty($data->whatsapp)) {
    echo json_encode(['status' => 'error', 'message' => 'Data wajib (Nama, Username Catur, WA) tidak boleh kosong.']);
    exit;
}
$id = !empty($data->id) ? (int)$data->id : null;
$turnamen_id = (int)$data->turnamen_id;
$nama = htmlspecialchars(strip_tags(trim($data->nama)), ENT_QUOTES, 'UTF-8');
$nama_asli = htmlspecialchars(strip_tags(trim($data->nama_asli ?? '')), ENT_QUOTES, 'UTF-8');
$tanggal_lahir = !empty($data->tanggal_lahir) ? $data->tanggal_lahir : null;
$domisili = htmlspecialchars(strip_tags(trim($data->domisili ?? '')), ENT_QUOTES, 'UTF-8');
$whatsapp = preg_replace("/[^0-9]/", "", $data->whatsapp);
$no_dana = preg_replace("/[^0-9]/", "", $data->no_dana ?? '');
$username_catur = htmlspecialchars(strip_tags(trim($data->username_catur)), ENT_QUOTES, 'UTF-8');
$tiktok = htmlspecialchars(strip_tags(trim($data->tiktok ?? '')), ENT_QUOTES, 'UTF-8');
$status = in_array($data->status, ['Pending', 'Disetujui', 'Ditolak']) ? $data->status : 'Pending';
if ($id) {
    $stmt = $conn->prepare("UPDATE pendaftar_turnamen SET nama=?, nama_asli=?, tanggal_lahir=?, domisili=?, whatsapp=?, no_dana=?, username_catur=?, tiktok=?, status=? WHERE id=?");
    $stmt->bind_param("sssssssssi", $nama, $nama_asli, $tanggal_lahir, $domisili, $whatsapp, $no_dana, $username_catur, $tiktok, $status, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Data peserta berhasil diperbarui.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal mengupdate peserta.']);
    }
    $stmt->close();
} else {
    $stmt = $conn->prepare("INSERT INTO pendaftar_turnamen (turnamen_id, nama, nama_asli, tanggal_lahir, domisili, whatsapp, no_dana, username_catur, tiktok, waktu_daftar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)");
    $stmt->bind_param("isssssssss", $turnamen_id, $nama, $nama_asli, $tanggal_lahir, $domisili, $whatsapp, $no_dana, $username_catur, $tiktok, $status);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Peserta manual berhasil ditambahkan.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menambahkan peserta.']);
    }
    $stmt->close();
}
$conn->close();
?>
<?php
session_start();
header('Content-Type: application/json');

// Proteksi: Pastikan hanya super_admin yang bisa mengakses
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_role'] !== 'super_admin') {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak. Hanya Super Admin yang diizinkan.']);
    exit;
}

// Lokasi file penanda maintenance
$flag_file = '../config/maintenance.flag';
$data = json_decode(file_get_contents("php://input"));

if (isset($data->action)) {
    if ($data->action === 'on') {
        // Buat file penanda
        file_put_contents($flag_file, '1');
        echo json_encode(['status' => 'success', 'maintenance' => true]);
    } elseif ($data->action === 'off') {
        // Hapus file penanda
        if (file_exists($flag_file)) {
            unlink($flag_file);
        }
        echo json_encode(['status' => 'success', 'maintenance' => false]);
    } elseif ($data->action === 'check') {
        // Cek status saat ini
        echo json_encode(['status' => 'success', 'maintenance' => file_exists($flag_file)]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Aksi tidak valid.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Parameter tidak lengkap.']);
}
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
require_once '../config/db.php';
if (file_exists('../config/registration_closed.flag')) {
    echo json_encode(["status" => "error", "message" => "Mohon maaf, pendaftaran saat ini sedang ditutup."]);
    $conn->close();
    exit;
}
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->whatsapp)) {
    $nama = $conn->real_escape_string($data->name);
    $nama_asli = isset($data->nama_asli) ? $conn->real_escape_string($data->nama_asli) : '';
    $tanggal_lahir = isset($data->tanggal_lahir) ? $conn->real_escape_string($data->tanggal_lahir) : '';
    $lokasi = isset($data->lokasi) ? $conn->real_escape_string($data->lokasi) : '';
    $whatsapp = $conn->real_escape_string($data->whatsapp);
    $username_catur = $conn->real_escape_string($data->chessUsername);
    $motivasi = $conn->real_escape_string($data->motivation);
    $tiktok = isset($data->tiktok) ? $conn->real_escape_string($data->tiktok) : '';
    $seputar_saya = isset($data->about) ? $conn->real_escape_string($data->about) : '';
    if (!empty($username_catur)) {
        $check_sql = "SELECT id FROM anggota WHERE LOWER(username_catur) = LOWER('$username_catur')";
        $check_result = $conn->query($check_sql);
        if ($check_result && $check_result->num_rows > 0) {
            echo json_encode(["status" => "error", "message" => "Username Chess.com '@$username_catur' sudah terdaftar sebagai anggota. Tidak boleh mendaftar ulang."]);
            $conn->close();
            exit; 
        }
    }
    $sql = "INSERT INTO anggota (nama, nama_asli, tanggal_lahir, lokasi, email, whatsapp, tiktok, username_catur, motivasi, seputar_saya, jabatan, status, tanggal_daftar) 
            VALUES ('$nama', '$nama_asli', '$tanggal_lahir', '$lokasi', '-', '$whatsapp', '$tiktok', '$username_catur', '$motivasi', '$seputar_saya', 'Anggota', 'Pending', NOW())";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Pendaftaran berhasil."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal mendaftar: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
}
$conn->close();
?>
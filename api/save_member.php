<?php
// Matikan error log default agar tidak memecah struktur JSON jika ada warning
error_reporting(0);
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->nama) && isset($data->jabatan)) {
    $id = isset($data->id) && $data->id !== "" ? (int)$data->id : 0;
    
    $nama = $conn->real_escape_string($data->nama);
    $email = isset($data->email) ? $conn->real_escape_string($data->email) : '-';
    $whatsapp = isset($data->whatsapp) ? $conn->real_escape_string($data->whatsapp) : '-';
    $username_catur = isset($data->username_catur) ? $conn->real_escape_string($data->username_catur) : '';
    $jabatan = $conn->real_escape_string($data->jabatan);
    $status = isset($data->status) ? $conn->real_escape_string($data->status) : 'Aktif';
    $foto = isset($data->foto) ? $conn->real_escape_string($data->foto) : null;

    try {
        if ($id > 0) {
            // Mode UPDATE (Edit) -> Hapus update kolom 'alamat'
            $sql = "UPDATE anggota SET 
                    nama='$nama', email='$email', whatsapp='$whatsapp', 
                    username_catur='$username_catur', jabatan='$jabatan', 
                    status='$status'";
            
            // Jika ada foto baru yang diunggah, ikut perbarui
            if ($foto !== null) { 
                $sql .= ", foto='$foto'"; 
            }
            $sql .= " WHERE id=$id";
        } else {
            // Mode INSERT (Tambah Baru) -> Hapus kolom 'alamat'
            $sql = "INSERT INTO anggota (nama, email, whatsapp, username_catur, jabatan, status, foto, tanggal_daftar) 
                    VALUES ('$nama', '$email', '$whatsapp', '$username_catur', '$jabatan', '$status', '$foto', NOW())";
        }

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success"]);
        } else {
            // Jika query gagal (misal kolom tidak ditemukan), kirim pesan error sebagai JSON
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    } catch (Exception $e) {
        // Tangkap fatal error MySQLi di PHP 8+ agar tetap menjadi JSON
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
}
$conn->close();
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['user_logged_in']) || empty($_GET['id'])) {
    echo json_encode(['status' => 'error']); exit;
}

$target_id = (int)$_GET['id'];
$sql = "SELECT nama, username_catur, avatar, seputar_saya, tanggal_daftar, jabatan FROM anggota WHERE id = $target_id";
$res = $conn->query($sql);
if ($res->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Member tidak ditemukan']); exit;
}
$profile = $res->fetch_assoc();
$target_nama = $conn->real_escape_string($profile['nama']);
$target_catur = $conn->real_escape_string($profile['username_catur'] ?? '');
$sql_turnamen = "SELECT t.judul, t.tanggal, 'Turnamen' as tipe_kegiatan 
                 FROM pendaftar_turnamen pt 
                 JOIN turnamen t ON pt.turnamen_id = t.id 
                 WHERE (pt.nama = '$target_nama' OR (pt.username_catur = '$target_catur' AND pt.username_catur != '')) 
                 AND pt.status = 'Disetujui' 
                 ORDER BY t.tanggal DESC";
                 
$res_t = $conn->query($sql_turnamen);
$kegiatan = [];
if ($res_t) {
    while ($row = $res_t->fetch_assoc()) {
        $kegiatan[] = $row;
    }
}
$sql_agenda = "SELECT ak.judul, ak.tanggal, ak.tipe as tipe_kegiatan, aa.status_kehadiran 
               FROM absensi_agenda aa 
               JOIN agenda_kegiatan ak ON aa.agenda_id = ak.id 
               WHERE aa.anggota_id = $target_id 
               ORDER BY ak.tanggal DESC";

$res_a = $conn->query($sql_agenda);
if ($res_a) {
    while ($row = $res_a->fetch_assoc()) {
        $kegiatan[] = $row;
    }
}
usort($kegiatan, function($a, $b) {
    return strtotime($b['tanggal']) - strtotime($a['tanggal']);
});
$profile['riwayat_kegiatan'] = $kegiatan;

// ---------------- FITUR LENCANA ----------------
$badge_titles = [
    'juara_turnamen' => 'Juara Turnamen', 
    'donatur' => 'Donatur', 
    'member_aktif' => 'Member Paling Aktif', 
    'pecandu_kelas' => 'Pecandu Kelas', 
    'penonton_terbaik' => 'Penonton Terbaik', 
    'pelatih' => 'Pelatih', 
    'pentolan' => 'Pentolan', 
    'pelawak' => 'Pelawak', 
    'member_setia' => 'Member Setia', 
    'pemain_gambit' => 'Pemain Gambit'
];

$sql_lencana = "SELECT tipe_lencana, keterangan, tanggal_diberikan FROM member_lencana WHERE anggota_id = $target_id ORDER BY tanggal_diberikan DESC";
$res_lencana = $conn->query($sql_lencana);
$pencapaian = [];
if ($res_lencana) {
    while ($row = $res_lencana->fetch_assoc()) {
        $tipe = $row['tipe_lencana'];
        $row['nama_lencana_formatted'] = $badge_titles[$tipe] ?? 'Lencana Khusus';
        $pencapaian[] = $row;
    }
}
$profile['pencapaian'] = $pencapaian;
// -----------------------------------------------

echo json_encode(['status' => 'success', 'data' => $profile]);
?>
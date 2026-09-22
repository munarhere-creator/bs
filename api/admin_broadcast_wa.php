<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->target) || empty($data->message)) {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
    exit;
}

$target = $data->target;
$rawMessage = $data->message;
$recipients = [];

// 1. AMBIL DAFTAR NOMOR DARI DATABASE
if ($target === 'member_aktif') {
    $sql = "SELECT nama, whatsapp FROM anggota WHERE status = 'Aktif'";
    $res = $conn->query($sql);
    if($res) while($r = $res->fetch_assoc()) $recipients[] = $r;
} else if ($target === 'member_pending') {
    $sql = "SELECT nama, whatsapp FROM anggota WHERE status = 'Pending'";
    $res = $conn->query($sql);
    if($res) while($r = $res->fetch_assoc()) $recipients[] = $r;
} else if (str_starts_with($target, 'event_')) {
    $evId = (int) str_replace('event_', '', $target);
    $sql = "SELECT nama, whatsapp FROM pendaftar_turnamen WHERE turnamen_id = $evId";
    $res = $conn->query($sql);
    if($res) while($r = $res->fetch_assoc()) $recipients[] = $r;
}

if (count($recipients) === 0) {
    echo json_encode(["status" => "error", "message" => "Tidak ada nomor tujuan."]);
    exit;
}

// 2. FORMAT DATA UNTUK FONNTE API
// Fonnte membaca target dengan format "nomor1|nama1, nomor2|nama2"
$targetString = "";
foreach($recipients as $r) {
    // Pastikan nomor rapi dan format 62
    $noWa = preg_replace('/\D/', '', $r['whatsapp']);
    if (str_starts_with($noWa, '0')) {
        $noWa = '62' . substr($noWa, 1);
    }
    $nama = $r['nama'];
    $targetString .= "$noWa|$nama,";
}
$targetString = rtrim($targetString, ','); // Buang koma terakhir

// Ganti variabel {nama} ke format {name} (sesuai standar API Fonnte)
$msgFonnte = str_replace("{nama}", "{name}", $rawMessage);

// 3. TEMBAK API FONNTE
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.fonnte.com/send',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => array(
    'target' => $targetString,
    'message' => $msgFonnte, 
    'delay' => '2' // Delay 2 detik antar pesan agar tidak mudah di-banned WA
  ),
  CURLOPT_HTTPHEADER => array(
    'GywRErbjDrFp9oF7UjPsDRnL2iLPm8joZz7vPXiFDGDcNL' // MASUKKAN TOKEN FONNTE DI SINI NANTI
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(["status" => "error", "message" => "Sistem Error: " . $err]);
} else {
    $resJson = json_decode($response);
    if ($resJson && $resJson->status) {
        echo json_encode(["status" => "success", "message" => "Broadcast ke " . count($recipients) . " nomor sedang dikirim oleh server!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Fonnte Error: " . ($resJson->reason ?? 'Cek token API Anda.')]);
    }
}
$conn->close();
?>
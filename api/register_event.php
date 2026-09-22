<?php
session_start();
error_reporting(0);
header('Content-Type: application/json');
require_once '../config/db.php';
if (isset($_SESSION['last_event_reg']) && (time() - $_SESSION['last_event_reg']) < 10) {
    echo json_encode(["status" => "error", "message" => "Terlalu banyak request. Tunggu beberapa saat."]);
    exit;
}
$_SESSION['last_event_reg'] = time();
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->event_id) && !empty($data->nama) && !empty($data->username_catur) && !empty($data->no_dana)) {
    $event_id = (int)$data->event_id;
    $nama = htmlspecialchars(strip_tags(trim($data->nama)), ENT_QUOTES, 'UTF-8');
    $nama_asli = htmlspecialchars(strip_tags(trim($data->nama_asli ?? '')), ENT_QUOTES, 'UTF-8');
    $tanggal_lahir = htmlspecialchars(strip_tags(trim($data->tanggal_lahir ?? '')), ENT_QUOTES, 'UTF-8');
    $domisili = htmlspecialchars(strip_tags(trim($data->domisili ?? '')), ENT_QUOTES, 'UTF-8');
    $tiktok = htmlspecialchars(strip_tags(trim($data->tiktok ?? '')), ENT_QUOTES, 'UTF-8');
    $whatsapp = preg_replace("/[^0-9]/", "", $data->whatsapp);
    $no_dana = preg_replace("/[^0-9]/", "", $data->no_dana);
    $username_catur = htmlspecialchars(strip_tags(trim($data->username_catur)), ENT_QUOTES, 'UTF-8');
    $stmt_ev = $conn->prepare("SELECT rating_min, rating_max FROM turnamen WHERE id = ?");
    $stmt_ev->bind_param("i", $event_id);
    $stmt_ev->execute();
    $event_query = $stmt_ev->get_result();
    
    if ($event_query->num_rows > 0) {
        $event_data = $event_query->fetch_assoc();
        $min_rating = (int)$event_data['rating_min'];
        $max_rating = (int)$event_data['rating_max'];
    } else {
        echo json_encode(["status" => "error", "message" => "Turnamen tidak ditemukan."]);
        exit;
    }
    $stmt_ev->close();
    $options = ["http" => ["header" => "User-Agent: BlunderSquad-TournamentApp/1.0"]];
    $context = stream_context_create($options);
    $profile_json = @file_get_contents("https://api.chess.com/pub/player/" . urlencode($username_catur), false, $context);
    if ($profile_json) {
        $profile = json_decode($profile_json, true);
        if (isset($profile['joined']) && (time() - $profile['joined']) / (30 * 24 * 60 * 60) < 6) {
            echo json_encode(["status" => "error", "message" => "Ditolak sistem: Umur akun kurang dari 6 bulan!"]);
            exit;
        }
    }
    $stats_json = @file_get_contents("https://api.chess.com/pub/player/" . urlencode($username_catur) . "/stats", false, $context);
    if ($stats_json) {
        $stats = json_decode($stats_json, true);
        $total_games = 0; $ratings = [];
        foreach (['chess_rapid', 'chess_blitz', 'chess_bullet'] as $mode) {
            if (isset($stats[$mode]['record'])) {
                $total_games += ($stats[$mode]['record']['win'] + $stats[$mode]['record']['loss'] + $stats[$mode]['record']['draw']);
            }
            if (isset($stats[$mode]['last']['rating'])) $ratings[] = $stats[$mode]['last']['rating'];
        }
        if ($total_games < 400) {
            echo json_encode(["status" => "error", "message" => "Ditolak sistem: Total game akun kurang dari 400!"]);
            exit;
        }
        if (count($ratings) > 0) {
            $overall_rating = round(array_sum($ratings) / count($ratings));
            if ($overall_rating < $min_rating || $overall_rating > $max_rating) {
                echo json_encode(["status" => "error", "message" => "Ditolak sistem: Rating melanggar batas turnamen ($min_rating - $max_rating)."]);
                exit;
            }}}
    $stmt_dup = $conn->prepare("SELECT id FROM pendaftar_turnamen WHERE turnamen_id = ? AND (whatsapp = ? OR no_dana = ? OR LOWER(username_catur) = LOWER(?))");
    $stmt_dup->bind_param("isss", $event_id, $whatsapp, $no_dana, $username_catur);
    $stmt_dup->execute();
    if ($stmt_dup->get_result()->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Nomor WA, DANA, atau Username Chess.com sudah terdaftar di turnamen ini."]);
        exit;
    }
    $stmt_dup->close();
    $stmt_glob = $conn->prepare("SELECT username_catur FROM pendaftar_turnamen WHERE whatsapp = ? OR no_dana = ? ORDER BY id DESC LIMIT 1");
    $stmt_glob->bind_param("ss", $whatsapp, $no_dana);
    $stmt_glob->execute();
    $glob_res = $stmt_glob->get_result();
    if ($glob_res->num_rows > 0) {
        $row = $glob_res->fetch_assoc();
        if (strtolower($row['username_catur']) !== strtolower($username_catur)) {
            echo json_encode(["status" => "error", "message" => "Nomor ini terikat permanen dengan akun chess.com: @" . $row['username_catur'] . ". Jangan gunakan akun berbeda!"]);
            exit;
        }
    }
    $stmt_glob->close();
    $stmt_insert = $conn->prepare("INSERT INTO pendaftar_turnamen (turnamen_id, nama, nama_asli, tanggal_lahir, domisili, whatsapp, no_dana, username_catur, tiktok, waktu_daftar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt_insert->bind_param("issssssss", $event_id, $nama, $nama_asli, $tanggal_lahir, $domisili, $whatsapp, $no_dana, $username_catur, $tiktok);

    if ($stmt_insert->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal mendaftar ke database."]);
    }
    $stmt_insert->close();
} else {
    echo json_encode(["status" => "error", "message" => "Data pendaftaran tidak lengkap."]);
}
$conn->close();
?>
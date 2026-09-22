<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->event_id)) {
    $event_id = (int)$data->event_id;
    $wa = $conn->real_escape_string($data->wa ?? '');
    $dana = $conn->real_escape_string($data->dana ?? '');

    if (empty($wa) && empty($dana)) {
        echo json_encode(["status" => "clear"]);
        exit;
    }
    $sql = "SELECT id FROM pendaftar_turnamen
            WHERE turnamen_id = $event_id
            AND (whatsapp = '$wa' OR no_dana = '$dana') LIMIT 1";

    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        echo json_encode(["status" => "found"]);
    } else {
        echo json_encode(["status" => "clear"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID event kosong"]);
}
$conn->close();
?>
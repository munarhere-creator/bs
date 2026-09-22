<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$flagFile = '../config/registration_closed.flag';
echo json_encode([
    'status' => 'success', 
    'is_open' => !file_exists($flagFile)
]);
?>
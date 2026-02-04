<?php
// Test Google Sheets Webhook

header('Content-Type: application/json');

$googleSheetsWebhook = 'https://script.google.com/macros/s/AKfycby3C5dVSGN8sh3kSyNolkz0E667n2wYMbzH6R1Fxfz4XI196RcJiDs3Yg8DXus2gfTb/exec';

$data = json_encode([
    'user_id' => 'test123',
    'user_message' => 'Тестовое сообщение от пользователя',
    'bot_response' => 'Тестовый ответ бота'
]);

$ch = curl_init($googleSheetsWebhook);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo json_encode([
    'status' => 'Test Complete',
    'http_code' => $httpCode,
    'response' => $response,
    'error' => $error ?: 'none',
    'data_sent' => json_decode($data)
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
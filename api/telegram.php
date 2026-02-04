<?php
/**
 * api/telegram.php
 * Secure backend for sending Telegram messages
 */

header('Content-Type: application/json');

// --- CONFIGURATION ---
// SECURE: Token is stored here, not in client-side JS
$TG_BOT_TOKEN = '7640486720:AAGKwluT4H8VbC0x_A-H_Nf4--21Zr-mIig';
$TG_CHAT_ID = '183174525';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['text'] ?? '';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message text is required']);
    exit;
}

// --- SEND TO TELEGRAM ---
$url = "https://api.telegram.org/bot{$TG_BOT_TOKEN}/sendMessage";
$data = [
    'chat_id' => $TG_CHAT_ID,
    'text' => $message
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10 seconds timeout

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// --- RESPONSE HANDLING ---
if ($httpCode >= 200 && $httpCode < 300 && $response) {
    echo json_encode(['success' => true]);
} else {
    // Log error locally if needed
    // error_log("Telegram API Error: " . $response . " Curl Error: " . $curlError);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send message',
        'debug' => $httpCode // Optional: remove in production
    ]);
}
?>
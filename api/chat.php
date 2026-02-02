<?php
// api/chat.php
// OpenAI Proxy for Loops Agency AI Consultant

// 1. SETTINGS
$apiKey = 'YOUR_OPENAI_API_KEY'; // <--- REPLACE THIS (User will do this)
$model = 'gpt-4o'; // or 'gpt-3.5-turbo'

// System Prompt
$systemPrompt = "Ты — старший эксперт агентства Loops (продукт: «Система Перелидоза» = Таргет + ИИ-агенты).
Твоя цель: квалифицировать лида, объяснить ценность и закрыть на разбор.

Факты:
- Кейс Chery Auto: снизили лид с $15 до $4.5, 450+ заявок/мес.
- Тарифы: «Тест-драйв» (9 млн сум), «Внедрение» (12 млн), «Масштаб» (24 млн).
- Гарантия: работаем до результата или возврат денег (по договору).

Стиль:
- Кратко, по делу, дружелюбно, но экспертно.
- Не пиши 'Привет' в каждом сообщении.
- Используй Markdown (жирный шрифт, списки) для структуры.
- Если клиент спрашивает цену, сначала спроси про его нишу/объем, потом называй цену (или дай вилку).
";

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

// 2. Read Input
$input = json_decode(file_get_contents('php://input'), true);
$messages = $input['messages'] ?? [];

// Validate
if (empty($messages)) {
    echo "data: " . json_encode(['error' => 'No messages provided']) . "\n\n";
    exit;
}

// Prepend System Message
array_unshift($messages, ['role' => 'system', 'content' => $systemPrompt]);

// 3. Prepare OpenAI Request
$url = 'https://api.openai.com/v1/chat/completions';
$data = [
    'model' => $model,
    'messages' => $messages,
    'stream' => true,
    'temperature' => 0.7
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) {
    echo $chunk;
    flush();
    return strlen($chunk);
});

// 4. Execute
curl_exec($ch);
curl_close($ch);
?>

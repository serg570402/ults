<?php
header('Content-Type: application/json');

require 'dbConnect.php'; // your PDO connection

$targetLang = $_POST['targetLang'] ?? '';
$assistLang = $_POST['assistLang'] ?? '';
$songNum    = (int) ($_POST['songNum'] ?? 0);
$lineNum    = (int) ($_POST['lineNum'] ?? 0);
$line       = $_POST['line'] ?? '';

try {

    // 1️⃣ Check if exists
    $stmt = $pdo->prepare("
        SELECT translated_line FROM translations
        WHERE targetLang = ?
        AND songNum = ?
        AND lineNum = ?
        AND assistLang = ?
        LIMIT 1
    ");

    // $stmt = $pdo->prepare("SELECT * FROM translations LIMIT 1");
    // $stmt->execute();
    // $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // echo json_encode($row);
    // exit;

    $stmt->execute([$targetLang, $songNum, $lineNum, $assistLang]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        echo json_encode([
            "status"          => "found",
            "translated_line" => $row['translated_line'],
        ]);
        exit;
    }

    // 2️⃣ Not found → call AI
    $aiText = callAI($line, $targetLang, $assistLang);

    // 3️⃣ Insert
    $insert = $pdo->prepare("
        INSERT INTO translations
        (targetLang, songNum, lineNum, assistLang, translated_line)
        VALUES (?, ?, ?, ?, ?)
    ");

    $insert->execute([
        $targetLang,
        $songNum,
        $lineNum,
        $assistLang,
        $aiText,
    ]);

    echo json_encode([
        "status" => "generated",
        "text"   => $aiText,
    ]);

} catch (Throwable $e) {

    echo json_encode([
        "status"       => "error",
        "caught_error" => $e->getMessage(),
    ]);
}

function callAI($line, $targetLang, $assistLang)
{
    if (strlen($line) > 500) {
        exit;
    }

    $apiKey = "YOUR_API_KEY";

    $prompt = "Translate from $assistLang to $targetLang:\n\n$line";

    $data = [
        "model"    => "gpt-4o-mini",
        "messages" => [
            ["role" => "user", "content" => $prompt],
        ],
    ];

    $ch = curl_init("https://api.openai.com/v1/chat/completions");

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            "Content-Type: application/json",
            "Authorization: Bearer $apiKey",
        ],
        CURLOPT_POSTFIELDS     => json_encode($data),
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $json = json_decode($response, true);

    return $json['choices'][0]['message']['content'] ?? '';
}

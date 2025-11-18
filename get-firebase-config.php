<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

// Firebase configuration from environment
$firebaseConfig = [
    'apiKey' => getenv('FIREBASE_API_KEY'),
    'authDomain' => getenv('FIREBASE_AUTH_DOMAIN'),
    'projectId' => getenv('FIREBASE_PROJECT_ID'),
    'storageBucket' => getenv('FIREBASE_STORAGE_BUCKET'),
    'messagingSenderId' => getenv('FIREBASE_MESSAGING_SENDER_ID'),
    'appId' => getenv('FIREBASE_APP_ID')
];

// Validate all required fields exist
$missingFields = [];
foreach ($firebaseConfig as $key => $value) {
    if (empty($value)) {
        $missingFields[] = $key;
    }
}

if (!empty($missingFields)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Missing Firebase configuration',
        'missing' => $missingFields
    ]);
    exit;
}

echo json_encode($firebaseConfig);
?>

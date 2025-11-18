<?php
// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env file not found at: ' . $path);
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Skip lines without = sign
        if (strpos($line, '=') === false) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Remove quotes if present
        $value = trim($value, '"\'');

        if (!array_key_exists($name, $_ENV)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }
}

try {
    loadEnv(__DIR__ . '/.env');
    
    // Stripe configuration (SECRET key must never be exposed!)
    define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY'));
    define('STRIPE_PUBLISHABLE_KEY', getenv('STRIPE_PUBLISHABLE_KEY'));
    
    // Firebase configuration (These are safe to expose)
    define('FIREBASE_API_KEY', getenv('FIREBASE_API_KEY'));
    define('FIREBASE_AUTH_DOMAIN', getenv('FIREBASE_AUTH_DOMAIN'));
    define('FIREBASE_PROJECT_ID', getenv('FIREBASE_PROJECT_ID'));
    define('FIREBASE_STORAGE_BUCKET', getenv('FIREBASE_STORAGE_BUCKET'));
    define('FIREBASE_MESSAGING_SENDER_ID', getenv('FIREBASE_MESSAGING_SENDER_ID'));
    define('FIREBASE_APP_ID', getenv('FIREBASE_APP_ID'));
    
    // Validate Stripe keys
    if (empty(STRIPE_SECRET_KEY) || STRIPE_SECRET_KEY === false) {
        throw new Exception('STRIPE_SECRET_KEY not found in .env file');
    }
    
    if (empty(STRIPE_PUBLISHABLE_KEY) || STRIPE_PUBLISHABLE_KEY === false) {
        throw new Exception('STRIPE_PUBLISHABLE_KEY not found in .env file');
    }
    
    // Validate Firebase keys
    if (empty(FIREBASE_API_KEY) || FIREBASE_API_KEY === false) {
        throw new Exception('FIREBASE_API_KEY not found in .env file');
    }
    
} catch (Exception $e) {
    error_log('Config error: ' . $e->getMessage());
    throw $e;
}
?>

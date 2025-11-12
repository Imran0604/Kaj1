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
        
        if (!array_key_exists($name, $_ENV)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }
}

try {
    loadEnv(__DIR__ . '/.env');
    
    // Stripe configuration
    define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY'));
    define('STRIPE_PUBLISHABLE_KEY', getenv('STRIPE_PUBLISHABLE_KEY'));
    
    // Validate that keys are loaded
    if (empty(STRIPE_SECRET_KEY) || STRIPE_SECRET_KEY === false) {
        throw new Exception('STRIPE_SECRET_KEY not found in .env file');
    }
    
    if (empty(STRIPE_PUBLISHABLE_KEY) || STRIPE_PUBLISHABLE_KEY === false) {
        throw new Exception('STRIPE_PUBLISHABLE_KEY not found in .env file');
    }
} catch (Exception $e) {
    error_log('Config error: ' . $e->getMessage());
    throw $e;
}
?>

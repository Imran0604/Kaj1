<?php
// Enable error logging for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Start output buffering to catch any errors
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit();
}

try {
    // Check if config file exists
    if (!file_exists(__DIR__ . '/config.php')) {
        throw new Exception('Config file not found');
    }
    
    require_once 'config.php';
    
    // Check if vendor autoload exists
    if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
        throw new Exception('Stripe library not installed. Run: composer install');
    }
    
    require_once 'vendor/autoload.php';
    
    // Check if Stripe keys are set
    if (!defined('STRIPE_SECRET_KEY') || empty(STRIPE_SECRET_KEY)) {
        throw new Exception('Stripe secret key not configured');
    }
    
    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Log received data for debugging
    error_log('Received data: ' . print_r($data, true));
    
    // Validate and sanitize amount
    $amount = isset($data['amount']) ? floatval($data['amount']) : 50;
    if ($amount <= 0) {
        throw new Exception('Invalid amount');
    }
    
    $donationType = isset($data['donationType']) ? $data['donationType'] : 'general';
    $currency = isset($data['currency']) ? strtolower($data['currency']) : 'usd';
    $donorName = isset($data['donorName']) ? $data['donorName'] : '';
    $donorEmail = isset($data['donorEmail']) ? $data['donorEmail'] : '';
    
    // Convert amount to cents/smallest currency unit
    $amountInCents = (int)($amount * 100);
    
    // Get the protocol and host dynamically
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host . '';
    
    // Create Stripe checkout session
    $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => $currency,
                'product_data' => [
                    'name' => ucfirst($donationType) . ' Donation',
                    'description' => 'Donation to Humanity First Foundation',
                ],
                'unit_amount' => $amountInCents,
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => $baseUrl . '/success.php?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $baseUrl . '/index.html?canceled=true',
        'customer_email' => $donorEmail ?: null,
        'metadata' => [
            'donation_type' => $donationType,
            'donor_name' => $donorName,
        ],
    ]);
    
    // Clear any output buffer
    ob_end_clean();
    
    echo json_encode(['id' => $session->id]);
} catch (Exception $e) {
    // Log error
    error_log('Error: ' . $e->getMessage());
    
    // Clear any output buffer
    ob_end_clean();
    
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

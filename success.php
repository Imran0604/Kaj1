<?php
require_once 'config.php';
require_once 'vendor/autoload.php';

\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

$session_id = $_GET['session_id'] ?? null;
$session = null;

if ($session_id) {
    try {
        $session = \Stripe\Checkout\Session::retrieve($session_id);
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donation Successful - Humanity First Foundation</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="success-container">
        <div class="success-card">
            <div class="success-icon">✓</div>
            <h1>Thank You for Your Donation!</h1>
            <p>Your generosity makes a real difference in transforming lives.</p>
            <?php if ($session): ?>
                <p><strong>Amount:</strong> <?php echo strtoupper($session->currency); ?> <?php echo number_format($session->amount_total / 100, 2); ?></p>
                <p><strong>Transaction ID:</strong> <?php echo $session->payment_intent; ?></p>
            <?php endif; ?>
            <a href="index.html" class="btn-primary">Return to Home</a>
        </div>
    </div>
</body>
</html>

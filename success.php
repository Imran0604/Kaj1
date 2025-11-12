<?php
require_once 'config.php';
require_once 'vendor/autoload.php';

\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

$session_id = $_GET['session_id'] ?? null;
$session = null;
$error = null;

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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Rajdhani", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-weight: 500;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0B6D47 0%, #1A5245 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .success-container {
            max-width: 650px;
            width: 90%;
            margin: 2rem auto;
            padding: 0;
        }

        .success-card {
            background: white;
            border-radius: 20px;
            padding: 3rem 2.5rem;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
            text-align: center;
            animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(40px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .success-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #0B6D47 0%, #1A5245 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
            margin: 0 auto 1.5rem;
            animation: scaleInBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 10px 30px rgba(11, 109, 71, 0.3);
        }

        @keyframes scaleInBounce {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.15);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        h1 {
            font-family: "Rajdhani", sans-serif;
            font-weight: 700;
            font-size: 2.25rem;
            color: #1A5245;
            margin: 0 0 1rem;
            line-height: 1.2;
        }

        .subtitle {
            font-size: 1.15rem;
            color: #666;
            margin: 0 0 2rem;
            line-height: 1.6;
        }

        .donation-details {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem 0;
            text-align: left;
            border: 2px solid #dee2e6;
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1rem 0;
            padding: 1rem 0;
            border-bottom: 1px solid #dee2e6;
        }

        .detail-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .detail-label {
            color: #1A5245;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .detail-value {
            color: #333;
            font-weight: 600;
            font-size: 1.1rem;
            text-align: right;
            word-break: break-word;
        }

        .amount-value {
            font-size: 1.5rem;
            color: #0B6D47;
            font-weight: 700;
        }

        .thank-you-message {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            color: #155724;
            padding: 1.25rem;
            border-radius: 10px;
            margin: 2rem 0;
            font-weight: 600;
            border: 2px solid #b1dfbb;
            line-height: 1.6;
        }

        .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #0B6D47 0%, #1A5245 100%);
            color: white;
            padding: 1.2rem 3rem;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 700;
            font-size: 1.15rem;
            margin-top: 1.5rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(11, 109, 71, 0.3);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #1A5245 0%, #0B6D47 100%);
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(11, 109, 71, 0.4);
        }

        .error-message {
            color: #dc3545;
            padding: 1.25rem;
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            border-radius: 10px;
            margin: 1.5rem 0;
            font-weight: 600;
            border: 2px solid #f1aeb5;
        }

        .decorative-line {
            width: 60px;
            height: 4px;
            background: linear-gradient(90deg, #0B6D47 0%, #1A5245 100%);
            margin: 1.5rem auto;
            border-radius: 2px;
        }

        @media (max-width: 768px) {
            .success-card {
                padding: 2rem 1.5rem;
            }

            h1 {
                font-size: 1.75rem;
            }

            .success-icon {
                width: 80px;
                height: 80px;
                font-size: 48px;
            }

            .detail-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }

            .detail-value {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="success-container">
        <div class="success-card">
            <div class="success-icon">✓</div>
            <h1>Thank You for Your Donation!</h1>
            <div class="decorative-line"></div>
            <p class="subtitle">Your generosity makes a real difference in transforming lives and bringing hope to communities worldwide.</p>
            
            <?php if ($error): ?>
                <div class="error-message">
                    <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
                </div>
            <?php elseif ($session): ?>
                <div class="donation-details">
                    <div class="detail-item">
                        <span class="detail-label">Donation Amount:</span>
                        <span class="detail-value amount-value">
                            <?php echo strtoupper($session->currency); ?> 
                            <?php echo number_format($session->amount_total / 100, 2); ?>
                        </span>
                    </div>
                    
                    <?php if (isset($session->metadata['donation_type'])): ?>
                    <div class="detail-item">
                        <span class="detail-label">Donation Type:</span>
                        <span class="detail-value">
                            <?php echo htmlspecialchars(ucfirst(str_replace('-', ' ', $session->metadata['donation_type']))); ?>
                        </span>
                    </div>
                    <?php endif; ?>
                    
                    <div class="detail-item">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value" style="font-size: 0.9rem;">
                            <?php echo htmlspecialchars($session->payment_intent); ?>
                        </span>
                    </div>
                    
                    <?php if ($session->customer_email): ?>
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">
                            <?php echo htmlspecialchars($session->customer_email); ?>
                        </span>
                    </div>
                    <?php endif; ?>
                </div>
                
                <div class="thank-you-message">
                    📧 A detailed receipt has been sent to your email address. Your contribution will help provide essential aid, healthcare, education, and hope to those who need it most. May your generosity bring countless blessings.
                </div>
            <?php else: ?>
                <div class="error-message">
                    No donation information available.
                </div>
            <?php endif; ?>
            
            <a href="index.html" class="btn-primary">← Return to Home</a>
        </div>
    </div>
</body>
</html>

<?php
require_once 'config.php';

header('Content-Type: application/json');
echo json_encode(['publishableKey' => STRIPE_PUBLISHABLE_KEY]);
?>

<?php
/**
 * send-mail.php — Contact form handler for rotomi.de
 *
 * Receives POST data from the front-end contact forms,
 * validates & sanitises input, then sends an e-mail via
 * PHP mail() (works out-of-the-box on KAS / All-Inkl).
 *
 * Target mailbox: hi@rotomi.de
 */

// ── Configuration ──────────────────────────────────────────
$recipient = 'hi@rotomi.de';
$site_name = 'ROTOMI';

// ── CORS & Headers ─────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://rotomi.de');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ── Honeypot check (anti-spam) ─────────────────────────────
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true, 'message' => 'Thank you for your message.']);
    exit;
}

// ── Input ──────────────────────────────────────────────────
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$company = trim($_POST['company'] ?? '');
$product = trim($_POST['product'] ?? '');
$message = trim($_POST['message'] ?? '');

// ── Validation ─────────────────────────────────────────────
$errors = [];

if ($name === '') {
    $errors[] = 'Name is required.';
}
if ($email === '') {
    $errors[] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
}
if ($message === '') {
    $errors[] = 'Message is required.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// ── Sanitize ───────────────────────────────────────────────
$safe = function ($v) {
    return htmlspecialchars(strip_tags($v), ENT_QUOTES, 'UTF-8');
};

// Product label mapping
$product_labels = [
    'sentinel-agent' => 'Sentinel Agent',
    'aria-robotics'  => 'ARIA Robotics',
    'agent-company'  => 'Agent Company',
    'general'        => 'General Inquiry',
];
$product_label = $product_labels[$product] ?? ($product ?: 'Not specified');

// ── Build Email ────────────────────────────────────────────
$subject = "[$site_name] New inquiry from " . $safe($name);

$body  = "New contact form submission from $site_name\n";
$body .= str_repeat('─', 48) . "\n\n";
$body .= "Name:    " . $safe($name) . "\n";
$body .= "Email:   " . $safe($email) . "\n";
$body .= "Company: " . ($company ? $safe($company) : '—') . "\n";
$body .= "Product: " . $safe($product_label) . "\n\n";
$body .= str_repeat('─', 48) . "\n\n";
$body .= "Message:\n\n" . $safe($message) . "\n\n";
$body .= str_repeat('─', 48) . "\n";
$body .= "Sent from: rotomi.de contact form\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";
$body .= "Time: " . date('Y-m-d H:i:s T') . "\n";

$headers  = "From: $site_name <noreply@rotomi.de>\r\n";
$headers .= "Reply-To: " . $safe($name) . " <" . $safe($email) . ">\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: ROTOMI-Contact/1.0\r\n";

// ── Send ───────────────────────────────────────────────────
$sent = @mail($recipient, $subject, $body, $headers);

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! We\'ll be in touch within 24 hours.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Could not send your message. Please email us directly at ' . $recipient
    ]);
}

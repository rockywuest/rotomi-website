<?php
/**
 * send-mail.php — Contact form handler for rotomi.de
 *
 * Receives JSON POST from the front-end contact form,
 * validates & sanitises input, then sends an e-mail via
 * PHP mail() (works out-of-the-box on KAS / All-Inkl).
 *
 * Target mailbox: sentinel@rotomi.de
 */

// ---------- config ----------
$recipient = 'sentinel@rotomi.de';
$subject   = 'Sentinel Agent — New Pilot Request';
// ----------------------------

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://rotomi.de');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
      http_response_code(204);
      exit;
}

// only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      http_response_code(405);
      echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
      exit;
}

// parse JSON body
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
      exit;
}

// --- required fields ---
$name    = trim($data['name']    ?? '');
$email   = trim($data['email']   ?? '');
$company = trim($data['company'] ?? '');

if ($name === '' || $email === '' || $company === '') {
      http_response_code(422);
      echo json_encode(['ok' => false, 'error' => 'name, email and company are required']);
      exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(422);
      echo json_encode(['ok' => false, 'error' => 'Invalid email address']);
      exit;
}

// --- optional fields ---
$agents  = trim($data['agents']  ?? '—');
$usecase = trim($data['usecase'] ?? '—');
$message = trim($data['message'] ?? '—');

// --- sanitise for mail body ---
$safe = function ($v) { return htmlspecialchars(strip_tags($v), ENT_QUOTES, 'UTF-8'); };

$body  = "New Sentinel Agent pilot request\n";
$body .= "================================\n\n";
$body .= "Name:       " . $safe($name)    . "\n";
$body .= "Email:      " . $safe($email)   . "\n";
$body .= "Company:    " . $safe($company)  . "\n";
$body .= "Agents:     " . $safe($agents)   . "\n";
$body .= "Use Case:   " . $safe($usecase)  . "\n";
$body .= "Message:    " . $safe($message)  . "\n\n";
$body .= "-- sent via rotomi.de contact form\n";

// --- headers ---
$headers  = "From: noreply@rotomi.de\r\n";
$headers .= "Reply-To: " . $safe($email) . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: rotomi-contact/1.0\r\n";

// --- send ---
$ok = mail($recipient, $subject, $body, $headers);

if ($ok) {
      echo json_encode(['ok' => true]);
} else {
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Mail delivery failed']);
}

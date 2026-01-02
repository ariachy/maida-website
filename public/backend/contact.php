<?php
/**
 * Maída Contact Form Handler
 * 
 * Security layers:
 * 1. Google reCAPTCHA Enterprise (score-based)
 * 2. Honeypot field
 * 3. Time-based check (form must be open 3+ seconds)
 * 4. Rate limiting (max 5 emails per IP per hour)
 * 5. Input sanitization
 * 
 * Configuration loaded from root .env file
 */

// ============================================
// LOAD ENVIRONMENT VARIABLES FROM ROOT .env
// ============================================
function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=value
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
                $value = $matches[2];
            }
            
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
    return true;
}

// Try multiple possible locations for .env
$envPaths = [
    __DIR__ . '/../../.env',           // From /api/ folder: ../../.env (root)
    __DIR__ . '/../.env',              // One level up
    $_SERVER['DOCUMENT_ROOT'] . '/../.env',  // Above public_html
    $_SERVER['DOCUMENT_ROOT'] . '/.env',     // In public_html (less secure but works)
];

$envLoaded = false;
foreach ($envPaths as $path) {
    if (file_exists($path)) {
        $envLoaded = loadEnv($path);
        break;
    }
}

if (!$envLoaded) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    error_log('Contact form error: .env file not found. Tried: ' . implode(', ', $envPaths));
    exit;
}

// ============================================
// CONFIGURATION FROM ENV
// ============================================
$config = [
    // SMTP Settings
    'smtp_host' => getenv('SMTP_HOST') ?: 'maida.pt',
    'smtp_port' => (int)(getenv('SMTP_PORT') ?: 465),
    'smtp_secure' => getenv('SMTP_SECURE') ?: 'ssl',
    'smtp_username' => getenv('SMTP_USERNAME') ?: '',
    'smtp_password' => getenv('SMTP_PASSWORD') ?: '',

    // Email Settings
    'to_email' => getenv('CONTACT_TO_EMAIL') ?: 'info@maida.pt',
    'from_email' => getenv('CONTACT_FROM_EMAIL') ?: 'info@maida.pt',
    'from_name' => getenv('CONTACT_FROM_NAME') ?: 'Maída Website',
    'subject_prefix' => '[Website Contact]',

    // reCAPTCHA Enterprise Settings
    'recaptcha_site_key' => getenv('RECAPTCHA_SITE_KEY') ?: '',
    'recaptcha_api_key' => getenv('RECAPTCHA_API_KEY') ?: '',
    'recaptcha_project_id' => getenv('RECAPTCHA_PROJECT_ID') ?: '',
    'recaptcha_action' => 'CONTACT_FORM',
    'recaptcha_min_score' => 0.5,

    // Security Settings
    'min_time_seconds' => 3,
    'rate_limit_max' => 5,
    'rate_limit_window' => 3600,
    'rate_limit_file' => __DIR__ . '/data/rate_limits.json',
];

// Validate required env vars
if (empty($config['smtp_password'])) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    error_log('Contact form error: SMTP_PASSWORD not set in .env');
    exit;
}

// ============================================
// CORS HEADERS
// ============================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://maida.pt');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function getClientIP() {
    $ip = $_SERVER['REMOTE_ADDR'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    return trim($ip);
}

function checkRateLimit($config) {
    $ip = getClientIP();
    $file = $config['rate_limit_file'];
    $limits = [];

    // Ensure data directory exists
    $dir = dirname($file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    if (file_exists($file)) {
        $limits = json_decode(file_get_contents($file), true) ?: [];
    }

    $now = time();
    $window = $config['rate_limit_window'];
    $max = $config['rate_limit_max'];

    // Clean old entries
    foreach ($limits as $key => $data) {
        if ($now - $data['first'] > $window) {
            unset($limits[$key]);
        }
    }

    if (isset($limits[$ip])) {
        if ($limits[$ip]['count'] >= $max) {
            return false;
        }
        $limits[$ip]['count']++;
    } else {
        $limits[$ip] = ['first' => $now, 'count' => 1];
    }

    file_put_contents($file, json_encode($limits));
    return true;
}

/**
 * Verify reCAPTCHA Enterprise token using simple REST API
 */
function verifyRecaptcha($config, $token) {
    if (empty($config['recaptcha_api_key']) || empty($config['recaptcha_project_id'])) {
        error_log('reCAPTCHA not configured - skipping verification');
        return ['success' => true, 'score' => 1.0, 'skipped' => true];
    }

    $url = sprintf(
        'https://recaptchaenterprise.googleapis.com/v1/projects/%s/assessments?key=%s',
        $config['recaptcha_project_id'],
        $config['recaptcha_api_key']
    );

    $data = [
        'event' => [
            'token' => $token,
            'siteKey' => $config['recaptcha_site_key'],
            'expectedAction' => $config['recaptcha_action']
        ]
    ];

    $options = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($data),
            'timeout' => 10,
            'ignore_errors' => true
        ]
    ];

    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        error_log('reCAPTCHA API request failed');
        return ['success' => false, 'error' => 'API request failed'];
    }

    $result = json_decode($response, true);

    // Check for API errors
    if (isset($result['error'])) {
        error_log('reCAPTCHA API error: ' . json_encode($result['error']));
        return ['success' => false, 'error' => $result['error']['message'] ?? 'API error'];
    }

    // Check if token is valid
    if (!isset($result['tokenProperties']['valid']) || !$result['tokenProperties']['valid']) {
        $reason = $result['tokenProperties']['invalidReason'] ?? 'Unknown';
        return ['success' => false, 'error' => 'Invalid token: ' . $reason];
    }

    // Get score
    $score = $result['riskAnalysis']['score'] ?? 0;

    return [
        'success' => true,
        'score' => $score,
        'action' => $result['tokenProperties']['action'] ?? '',
        'reasons' => $result['riskAnalysis']['reasons'] ?? []
    ];
}

function sendEmail($config, $name, $email, $subject, $message) {
    $phpmailerPath = __DIR__ . '/PHPMailer/src/PHPMailer.php';

    if (file_exists($phpmailerPath)) {
        require_once $phpmailerPath;
        require_once __DIR__ . '/PHPMailer/src/SMTP.php';
        require_once __DIR__ . '/PHPMailer/src/Exception.php';

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = $config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $config['smtp_username'];
            $mail->Password = $config['smtp_password'];
            $mail->SMTPSecure = $config['smtp_secure'];
            $mail->Port = $config['smtp_port'];

            $mail->setFrom($config['from_email'], $config['from_name']);
            $mail->addAddress($config['to_email']);
            $mail->addReplyTo($email, $name);

            $mail->isHTML(true);
            $mail->Subject = $config['subject_prefix'] . ' ' . $subject;
            $mail->Body = "
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {$name}</p>
                <p><strong>Email:</strong> {$email}</p>
                <p><strong>Subject:</strong> {$subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p>" . nl2br($message) . "</p>
                <hr>
                <p style='color: #888; font-size: 12px;'>
                    Sent from maida.pt contact form<br>
                    IP: " . getClientIP() . "<br>
                    Time: " . date('Y-m-d H:i:s') . "
                </p>
            ";
            $mail->AltBody = "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\n\nMessage:\n{$message}";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $mail->ErrorInfo);
            return false;
        }
    } else {
        // Fallback to PHP mail()
        $headers = "From: {$config['from_name']} <{$config['from_email']}>\r\n";
        $headers .= "Reply-To: {$name} <{$email}>\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        $body = "
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Subject:</strong> {$subject}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>" . nl2br($message) . "</p>
        ";

        return mail($config['to_email'], $config['subject_prefix'] . ' ' . $subject, $body, $headers);
    }
}

// ============================================
// MAIN LOGIC
// ============================================

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$name = sanitize($input['name'] ?? '');
$email = sanitize($input['email'] ?? '');
$subject = sanitize($input['subject'] ?? 'General Inquiry');
$message = sanitize($input['message'] ?? '');
$honeypot = $input['website'] ?? '';
$timestamp = intval($input['_timestamp'] ?? 0);
$recaptchaToken = $input['_recaptcha'] ?? '';

// ============================================
// SECURITY CHECKS
// ============================================

// 1. Honeypot check
if (!empty($honeypot)) {
    echo json_encode(['success' => true, 'message' => 'Thank you for your message!']);
    exit;
}

// 2. Time-based check
$timeDiff = time() - $timestamp;
if ($timeDiff < $config['min_time_seconds']) {
    echo json_encode(['success' => true, 'message' => 'Thank you for your message!']);
    exit;
}

// 3. reCAPTCHA Enterprise check
if (!empty($recaptchaToken)) {
    $recaptchaResult = verifyRecaptcha($config, $recaptchaToken);

    if (!$recaptchaResult['success']) {
        error_log('reCAPTCHA verification failed: ' . ($recaptchaResult['error'] ?? 'Unknown'));
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Security verification failed. Please refresh and try again.']);
        exit;
    }

    if (!isset($recaptchaResult['skipped']) && $recaptchaResult['score'] < $config['recaptcha_min_score']) {
        error_log('reCAPTCHA low score: ' . $recaptchaResult['score'] . ' for IP: ' . getClientIP());
        echo json_encode(['success' => true, 'message' => 'Thank you for your message!']);
        exit;
    }
} else if (!empty($config['recaptcha_api_key'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Security verification required. Please refresh and try again.']);
    exit;
}

// 4. Rate limiting
if (!checkRateLimit($config)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
    exit;
}

// 5. Field validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Please enter your name';
}

if (!validateEmail($email)) {
    $errors[] = 'Please enter a valid email address';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Please enter a message (at least 10 characters)';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
    exit;
}

// ============================================
// SEND EMAIL
// ============================================

if (sendEmail($config, $name, $email, $subject, $message)) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your message has been sent.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send message. Please try again or email us directly at info@maida.pt']);
}

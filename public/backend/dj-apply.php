<?php
/**
 * Maída DJ Application Form Handler
 * 
 * Security layers:
 * 1. Google reCAPTCHA Enterprise (score-based)
 * 2. Rate limiting (max 3 applications per IP per hour)
 * 3. Input sanitization
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
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
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
    __DIR__ . '/../../.env',
    __DIR__ . '/../.env',
    $_SERVER['DOCUMENT_ROOT'] . '/../.env',
    $_SERVER['DOCUMENT_ROOT'] . '/.env',
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
    error_log('DJ Application error: .env file not found');
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

    // Email Settings - DJ Applications go to djs@maida.pt
    'to_email' => 'djs@maida.pt',
    'from_email' => getenv('CONTACT_FROM_EMAIL') ?: 'noreply@maida.pt',
    'from_name' => 'Maída DJ Applications',
    'subject_prefix' => '[DJ Application]',

    // reCAPTCHA Enterprise Settings
    'recaptcha_site_key' => getenv('RECAPTCHA_SITE_KEY') ?: '',
    'recaptcha_api_key' => getenv('RECAPTCHA_API_KEY') ?: '',
    'recaptcha_project_id' => getenv('RECAPTCHA_PROJECT_ID') ?: '',
    'recaptcha_action' => 'DJ_APPLICATION',
    'recaptcha_min_score' => 0.5,

    // Security Settings
    'rate_limit_max' => 3,
    'rate_limit_window' => 3600,
    'rate_limit_file' => __DIR__ . '/data/dj_rate_limits.json',
];

// Validate required env vars
if (empty($config['smtp_password'])) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    error_log('DJ Application error: SMTP_PASSWORD not set in .env');
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

    if (isset($result['error'])) {
        error_log('reCAPTCHA API error: ' . json_encode($result['error']));
        return ['success' => false, 'error' => $result['error']['message'] ?? 'API error'];
    }

    if (!isset($result['tokenProperties']['valid']) || !$result['tokenProperties']['valid']) {
        $reason = $result['tokenProperties']['invalidReason'] ?? 'Unknown';
        return ['success' => false, 'error' => 'Invalid token: ' . $reason];
    }

    $score = $result['riskAnalysis']['score'] ?? 0;

    return [
        'success' => true,
        'score' => $score,
        'action' => $result['tokenProperties']['action'] ?? '',
    ];
}

function sendEmail($config, $name, $email, $phone, $genres, $musicLink, $message) {
    $phpmailerPath = __DIR__ . '/PHPMailer/src/PHPMailer.php';

    // Format genres as bullet list
    $genresList = is_array($genres) ? implode(', ', $genres) : $genres;

    // Build email body
    $htmlBody = "
        <h2>New DJ Application</h2>
        <table style='border-collapse: collapse; width: 100%; max-width: 600px;'>
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;'>Name:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$name}</td>
            </tr>
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Email:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'><a href='mailto:{$email}'>{$email}</a></td>
            </tr>
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Phone:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'><a href='tel:{$phone}'>{$phone}</a></td>
            </tr>
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Genres:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$genresList}</td>
            </tr>
    ";

    if (!empty($musicLink)) {
        $htmlBody .= "
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Music Link:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'><a href='{$musicLink}' target='_blank'>{$musicLink}</a></td>
            </tr>
        ";
    }

    if (!empty($message)) {
        $htmlBody .= "
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;'>Message:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>" . nl2br($message) . "</td>
            </tr>
        ";
    }

    $htmlBody .= "
        </table>
        <hr style='margin: 20px 0; border: none; border-top: 1px solid #eee;'>
        <p style='color: #888; font-size: 12px;'>
            Submitted from maida.pt DJ Application<br>
            IP: " . getClientIP() . "<br>
            Time: " . date('Y-m-d H:i:s') . "
        </p>
    ";

    $subject = $config['subject_prefix'] . ' ' . $name;

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
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = "DJ Application from {$name}\nEmail: {$email}\nPhone: {$phone}\nGenres: {$genresList}\nMusic: {$musicLink}\nMessage: {$message}";

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

        return mail($config['to_email'], $subject, $htmlBody, $headers);
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
$phone = sanitize($input['phone'] ?? '');
$genres = $input['genres'] ?? [];
$musicLink = sanitize($input['musicLink'] ?? '');
$message = sanitize($input['message'] ?? '');
$recaptchaToken = $input['_recaptcha'] ?? '';

// Sanitize genres array
if (is_array($genres)) {
    $genres = array_map('sanitize', $genres);
}

// ============================================
// SECURITY CHECKS
// ============================================

// 1. reCAPTCHA Enterprise check
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
        // Silently reject
        echo json_encode(['success' => true, 'message' => 'Thank you! Your application has been received.']);
        exit;
    }
} else if (!empty($config['recaptcha_api_key'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Security verification required. Please refresh and try again.']);
    exit;
}

// 2. Rate limiting
if (!checkRateLimit($config)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many submissions. Please try again later.']);
    exit;
}

// 3. Field validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Please enter your name';
}

if (!validateEmail($email)) {
    $errors[] = 'Please enter a valid email address';
}

if (empty($phone) || strlen($phone) < 8) {
    $errors[] = 'Please enter a valid phone number';
}

if (empty($genres) || !is_array($genres) || count($genres) === 0) {
    $errors[] = 'Please select at least one genre';
}

// Validate music link if provided
if (!empty($musicLink) && !filter_var($musicLink, FILTER_VALIDATE_URL)) {
    $errors[] = 'Please enter a valid URL for your music link';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
    exit;
}

// ============================================
// SEND EMAIL
// ============================================

if (sendEmail($config, $name, $email, $phone, $genres, $musicLink, $message)) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your application has been received.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send application. Please try again or email us directly at djs@maida.pt']);
}

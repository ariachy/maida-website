<?php
/**
 * Maída Job Application Form Handler
 *
 * Handles multipart/form-data submissions for job applications with
 * CV (required) and Photo (optional) file attachments.
 *
 * Security layers:
 * 1. Google reCAPTCHA Enterprise (score-based)
 * 2. Honeypot field
 * 3. Time-based check (form must be open 3+ seconds)
 * 4. Rate limiting (max 3 applications per IP per hour)
 * 5. File MIME type validation (server-side, not just extension)
 * 6. File size limits (3MB per file)
 * 7. Filename sanitization + standardized naming
 * 8. Input sanitization
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
    error_log('Job application error: .env file not found');
    exit;
}

// ============================================
// CONFIGURATION
// ============================================
$config = [
    // SMTP Settings
    'smtp_host' => getenv('SMTP_HOST') ?: 'maida.pt',
    'smtp_port' => (int)(getenv('SMTP_PORT') ?: 465),
    'smtp_secure' => getenv('SMTP_SECURE') ?: 'ssl',
    'smtp_username' => getenv('SMTP_USERNAME') ?: '',
    'smtp_password' => getenv('SMTP_PASSWORD') ?: '',

    // Email Settings - Job Applications go to recruitment@maida.pt
    'to_email' => 'recruitment@maida.pt',
    'from_email' => getenv('CONTACT_FROM_EMAIL') ?: 'noreply@maida.pt',
    'from_name' => 'Maída Job Applications',
    'subject_prefix' => '[Job Application]',

    // reCAPTCHA Enterprise
    'recaptcha_site_key' => getenv('RECAPTCHA_SITE_KEY') ?: '',
    'recaptcha_api_key' => getenv('RECAPTCHA_API_KEY') ?: '',
    'recaptcha_project_id' => getenv('RECAPTCHA_PROJECT_ID') ?: '',
    'recaptcha_action' => 'JOB_APPLICATION',
    'recaptcha_min_score' => 0.5,

    // Security
    'min_time_seconds' => 3,
    'rate_limit_max' => 3,
    'rate_limit_window' => 3600,
    'rate_limit_file' => __DIR__ . '/data/job_rate_limits.json',

    // File upload
    'max_file_size' => 3 * 1024 * 1024, // 3MB
    'allowed_cv_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
    'allowed_cv_exts' => ['pdf', 'jpg', 'jpeg', 'png'],
    'allowed_photo_mimes' => ['image/jpeg', 'image/png'],
    'allowed_photo_exts' => ['jpg', 'jpeg', 'png'],

    // Valid departments (whitelist)
    'valid_departments' => ['Kitchen', 'Bar', 'Floor'],
];

if (empty($config['smtp_password'])) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    error_log('Job application error: SMTP_PASSWORD not set in .env');
    exit;
}

// ============================================
// CORS / METHOD
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
// HELPERS
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

/**
 * ASCII-fold a string: remove accents, keep only [A-Z0-9-].
 * "José Gonçalves" -> "JOSE-GONCALVES"
 */
function asciiFold($str) {
    // Transliterate accented chars to ASCII
    if (function_exists('iconv')) {
        $folded = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);
        if ($folded !== false) {
            $str = $folded;
        }
    }
    $str = strtoupper($str);
    // Replace spaces and apostrophes with dash
    $str = preg_replace("/[\s'\"]+/", '-', $str);
    // Strip anything not A-Z, 0-9, or dash
    $str = preg_replace('/[^A-Z0-9-]/', '', $str);
    // Collapse multiple dashes
    $str = preg_replace('/-+/', '-', $str);
    // Trim dashes from ends
    $str = trim($str, '-');
    return $str ?: 'UNKNOWN';
}

/**
 * Build standardized filename: YYYYMMDD_FIRSTNAME-LASTNAME_POSITION_SUFFIX.ext
 * Falls back to department if position is empty.
 */
function buildFilename($name, $position, $department, $suffix, $ext) {
    $date = date('Ymd');
    $nameFolded = asciiFold($name);
    $positionFolded = !empty($position) ? asciiFold($position) : asciiFold($department);
    return sprintf('%s_%s_%s_%s.%s', $date, $nameFolded, $positionFolded, $suffix, strtolower($ext));
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
        return ['success' => false, 'error' => 'API request failed'];
    }

    $result = json_decode($response, true);

    if (isset($result['error'])) {
        return ['success' => false, 'error' => $result['error']['message'] ?? 'API error'];
    }

    if (!isset($result['tokenProperties']['valid']) || !$result['tokenProperties']['valid']) {
        $reason = $result['tokenProperties']['invalidReason'] ?? 'Unknown';
        return ['success' => false, 'error' => 'Invalid token: ' . $reason];
    }

    return [
        'success' => true,
        'score' => $result['riskAnalysis']['score'] ?? 0,
    ];
}

/**
 * Validate an uploaded file:
 * - Check upload error code
 * - Check size
 * - Check MIME type via finfo (not just extension)
 * - Check extension matches allowed list
 * Returns ['ok' => bool, 'error' => string, 'ext' => string, 'mime' => string]
 */
function validateUploadedFile($file, $allowedMimes, $allowedExts, $maxSize, $fieldLabel) {
    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return ['ok' => false, 'error' => "No {$fieldLabel} uploaded"];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File too large (server limit)',
            UPLOAD_ERR_FORM_SIZE => 'File too large',
            UPLOAD_ERR_PARTIAL => 'Upload incomplete, please try again',
            UPLOAD_ERR_NO_TMP_DIR => 'Server error, please try again',
            UPLOAD_ERR_CANT_WRITE => 'Server error, please try again',
        ];
        return ['ok' => false, 'error' => "{$fieldLabel}: " . ($errors[$file['error']] ?? 'Upload failed')];
    }

    if ($file['size'] > $maxSize) {
        $mb = round($maxSize / 1024 / 1024, 1);
        return ['ok' => false, 'error' => "{$fieldLabel} is too large (max {$mb}MB). Try compressing the file."];
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        return ['ok' => false, 'error' => "{$fieldLabel}: invalid upload"];
    }

    // Real MIME type (not trusting client-supplied type)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowedMimes, true)) {
        return ['ok' => false, 'error' => "{$fieldLabel}: file type not allowed. Please use PDF, JPG, or PNG."];
    }

    // Extension check (belt and braces)
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts, true)) {
        return ['ok' => false, 'error' => "{$fieldLabel}: file extension not allowed."];
    }

    // Normalize jpeg
    if ($ext === 'jpeg') {
        $ext = 'jpg';
    }

    return ['ok' => true, 'ext' => $ext, 'mime' => $mime];
}

function sendEmail($config, $data, $attachments) {
    $phpmailerPath = __DIR__ . '/PHPMailer/src/PHPMailer.php';

    $name = $data['name'];
    $email = $data['email'];
    $phone = $data['phone'];
    $department = $data['department'];
    $position = $data['position'];
    $message = $data['message'];

    $htmlBody = "
        <h2>New Job Application</h2>
        <table style='border-collapse: collapse; width: 100%; max-width: 600px;'>
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;'>Name:</td>
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
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Department:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'><strong>{$department}</strong></td>
            </tr>
    ";

    if (!empty($position)) {
        $htmlBody .= "
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Position:</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$position}</td>
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

    $attachmentList = '';
    foreach ($attachments as $att) {
        $attachmentList .= "<li>{$att['filename']}</li>";
    }

    $htmlBody .= "
        </table>
        <p style='margin-top: 20px;'><strong>Attachments:</strong></p>
        <ul>{$attachmentList}</ul>
        <hr style='margin: 20px 0; border: none; border-top: 1px solid #eee;'>
        <p style='color: #888; font-size: 12px;'>
            Submitted from maida.pt Job Application Form<br>
            IP: " . getClientIP() . "<br>
            Time: " . date('Y-m-d H:i:s') . "
        </p>
    ";

    $subject = $config['subject_prefix'] . ' ' . $department . ' — ' . $name;

    if (file_exists($phpmailerPath)) {
        require_once $phpmailerPath;
        require_once __DIR__ . '/PHPMailer/src/SMTP.php';
        require_once __DIR__ . '/PHPMailer/src/Exception.php';

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        try {
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            $mail->isSMTP();
            $mail->Host = $config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $config['smtp_username'];
            $mail->Password = $config['smtp_password'];
            $mail->SMTPSecure = $config['smtp_secure'];
            $mail->Port = $config['smtp_port'];

            $mail->setFrom($config['from_email'], $config['from_name']);
            $mail->addAddress($config['to_email']);
            $mail->addCC('annamaria.baydoun@gmail.com');
            $mail->addCC('anthony@thehappysalad.com');
            $mail->addReplyTo($email, $name);

            // Attach files with standardized names
            foreach ($attachments as $att) {
                $mail->addAttachment($att['tmp_path'], $att['filename']);
            }

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = "Job Application\n\nName: {$name}\nEmail: {$email}\nPhone: {$phone}\nDepartment: {$department}\nPosition: {$position}\n\nMessage:\n{$message}";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Error (job application): " . $mail->ErrorInfo);
            return false;
        }
    } else {
        error_log('PHPMailer not found — cannot send job application with attachments');
        return false;
    }
}

// ============================================
// MAIN LOGIC
// ============================================

// This endpoint uses multipart/form-data (not JSON) because of file uploads
$name = sanitize($_POST['name'] ?? '');
$email = sanitize($_POST['email'] ?? '');
$phone = sanitize($_POST['phone'] ?? '');
$department = sanitize($_POST['department'] ?? '');
$position = sanitize($_POST['position'] ?? '');
$message = sanitize($_POST['message'] ?? '');
$honeypot = $_POST['website'] ?? '';
$timestamp = intval($_POST['_timestamp'] ?? 0);
$recaptchaToken = $_POST['_recaptcha'] ?? '';
$consent = $_POST['consent'] ?? '';

// ============================================
// SECURITY CHECKS
// ============================================

// 1. Honeypot
if (!empty($honeypot)) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your application has been received.']);
    exit;
}

// 2. Time-based check
$timeDiff = time() - $timestamp;
if ($timeDiff < $config['min_time_seconds']) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your application has been received.']);
    exit;
}

// 3. reCAPTCHA
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
        echo json_encode(['success' => true, 'message' => 'Thank you! Your application has been received.']);
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
    echo json_encode(['success' => false, 'message' => 'Too many submissions. Please try again later.']);
    exit;
}

// ============================================
// FIELD VALIDATION
// ============================================
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Please enter your full name';
}

if (!validateEmail($email)) {
    $errors[] = 'Please enter a valid email address';
}

if (empty($phone) || strlen($phone) < 8) {
    $errors[] = 'Please enter a valid phone number';
}

if (!in_array($department, $config['valid_departments'], true)) {
    $errors[] = 'Please select a department (Kitchen, Bar, or Floor)';
}

if (empty($consent)) {
    $errors[] = 'Please accept the data processing consent';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
    exit;
}

// ============================================
// FILE VALIDATION
// ============================================

// CV — required
if (!isset($_FILES['cv']) || $_FILES['cv']['error'] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please upload your CV or resume']);
    exit;
}

$cvValidation = validateUploadedFile(
    $_FILES['cv'],
    $config['allowed_cv_mimes'],
    $config['allowed_cv_exts'],
    $config['max_file_size'],
    'CV'
);

if (!$cvValidation['ok']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $cvValidation['error']]);
    exit;
}

// Photo — optional
$photoValidation = null;
if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
    $photoValidation = validateUploadedFile(
        $_FILES['photo'],
        $config['allowed_photo_mimes'],
        $config['allowed_photo_exts'],
        $config['max_file_size'],
        'Photo'
    );

    if (!$photoValidation['ok']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $photoValidation['error']]);
        exit;
    }
}

// ============================================
// BUILD ATTACHMENTS WITH STANDARDIZED FILENAMES
// ============================================
$attachments = [];

$attachments[] = [
    'tmp_path' => $_FILES['cv']['tmp_name'],
    'filename' => buildFilename($name, $position, $department, 'CV', $cvValidation['ext']),
];

if ($photoValidation !== null) {
    $attachments[] = [
        'tmp_path' => $_FILES['photo']['tmp_name'],
        'filename' => buildFilename($name, $position, $department, 'PHOTO', $photoValidation['ext']),
    ];
}

// ============================================
// SEND EMAIL
// ============================================
$emailData = [
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'department' => $department,
    'position' => $position,
    'message' => $message,
];

if (sendEmail($config, $emailData, $attachments)) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your application has been received. We will get back to you soon.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send application. Please try again or email us directly at recruitment@maida.pt']);
}

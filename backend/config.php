<?php
// ---------- Database settings (change if your MySQL differs) ----------
const DB_HOST = '127.0.0.1';
const DB_NAME = 'car_rental';
const DB_USER = 'root';
const DB_PASS = '';          // XAMPP default is empty

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
session_start();

header('Content-Type: application/json; charset=utf-8');

// Allow the React dev server to call the API directly (the Vite proxy makes this optional)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ['http://localhost:5173', 'http://127.0.0.1:5173'], true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    try {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        json_out(['error' => 'Database connection failed. Is MySQL running and database.sql imported?'], 500);
    }
    return $pdo;
}

function json_out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_admin(): void {
    if (empty($_SESSION['admin_id'])) json_out(['error' => 'Admin login required'], 401);
}

function clean(?string $v): string { return trim(strip_tags((string)$v)); }

function resequence_table(PDO $pdo, string $table): void {
    if (!in_array($table, ['cars', 'bookings', 'admins'], true)) return;
    try {
        $rows = $pdo->query("SELECT id FROM `{$table}` ORDER BY id ASC")->fetchAll(PDO::FETCH_COLUMN);
        $expected = 1;
        $needsResequence = false;
        foreach ($rows as $currId) {
            if ((int)$currId !== $expected) {
                $needsResequence = true;
                break;
            }
            $expected++;
        }
        if (!$needsResequence) {
            return;
        }

        $stmt = $pdo->prepare("UPDATE `{$table}` SET id = ? WHERE id = ?");
        $newId = 1;
        foreach ($rows as $oldId) {
            if ((int)$oldId !== $newId) {
                $stmt->execute([$newId, (int)$oldId]);
            }
            $newId++;
        }
        $pdo->exec("ALTER TABLE `{$table}` AUTO_INCREMENT = {$newId}");
    } catch (Throwable $e) {
        // Silently ignore
    }
}

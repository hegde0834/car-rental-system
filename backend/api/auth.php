<?php
require __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {                       // who am I?
    json_out(['loggedIn' => !empty($_SESSION['admin_id']), 'username' => $_SESSION['admin_user'] ?? null]);
}

if ($method === 'POST' && $action === 'login') {
    $b = body();
    $stmt = db()->prepare('SELECT id, username, password_hash FROM admins WHERE username = ?');
    $stmt->execute([clean($b['username'] ?? '')]);
    $admin = $stmt->fetch();
    if (!$admin || !password_verify($b['password'] ?? '', $admin['password_hash'])) {
        json_out(['error' => 'Invalid username or password'], 401);
    }
    session_regenerate_id(true);
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_user'] = $admin['username'];
    json_out(['loggedIn' => true, 'username' => $admin['username']]);
}

if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    json_out(['loggedIn' => false]);
}

json_out(['error' => 'Bad request'], 400);

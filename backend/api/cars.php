<?php
require __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = db();

if ($method === 'GET') {
    $sql = "SELECT c.*,
              EXISTS(SELECT 1 FROM bookings b
                     WHERE b.car_id = c.id AND b.status IN ('Pending','Confirmed')
                       AND CURDATE() BETWEEN b.start_date AND b.end_date) AS rented_now
            FROM cars c ORDER BY c.id ASC";
    $cars = $pdo->query($sql)->fetchAll();
    foreach ($cars as &$c) {
        $c['id'] = (int)$c['id'];
        $c['seats'] = (int)$c['seats'];
        $c['price_per_day'] = (float)$c['price_per_day'];
        $c['rented_now'] = (bool)$c['rented_now'];
    }
    json_out($cars);
}

if ($method === 'POST') {                       // admin: add car
    require_admin();
    $b = body();
    $name  = clean($b['name'] ?? '');
    $brand = clean($b['brand'] ?? '');
    $type  = clean($b['type'] ?? 'Sedan');
    $trans = in_array($b['transmission'] ?? '', ['Manual', 'Automatic'], true) ? $b['transmission'] : 'Manual';
    $fuel  = in_array($b['fuel'] ?? '', ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'], true) ? $b['fuel'] : 'Petrol';
    $seats = (int)($b['seats'] ?? 5);
    $price = (float)($b['price_per_day'] ?? 0);
    $color = preg_match('/^#[0-9a-fA-F]{6}$/', $b['color'] ?? '') ? $b['color'] : '#2F5DA8';
    $img   = clean($b['image_url'] ?? '');
    if ($img !== '' && !preg_match('#^(https?://|/)#i', $img)) $img = '';

    if ($name === '' || $brand === '' || $price <= 0 || $seats < 1 || $seats > 20) {
        json_out(['error' => 'Name, brand, seats and a positive price are required'], 422);
    }
    resequence_table($pdo, 'cars');
    $stmt = $pdo->prepare('INSERT INTO cars (name, brand, type, transmission, fuel, seats, price_per_day, color, image_url)
                           VALUES (?,?,?,?,?,?,?,?,?)');
    $stmt->execute([$name, $brand, $type, $trans, $fuel, $seats, $price, $color, $img ?: null]);
    $newId = (int)$pdo->lastInsertId();
    resequence_table($pdo, 'cars');
    json_out(['id' => $newId, 'message' => 'Car added'], 201);
}

if ($method === 'DELETE') {                     // admin: delete car (its bookings are removed too)
    require_admin();
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('DELETE FROM cars WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) json_out(['error' => 'Car not found'], 404);
    resequence_table($pdo, 'cars');
    json_out(['message' => 'Car deleted']);
}

json_out(['error' => 'Method not allowed'], 405);

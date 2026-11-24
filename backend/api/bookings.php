<?php
require __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = db();

// ---- Public: customer creates a booking ----
if ($method === 'POST') {
    $b = body();
    $carId = (int)($b['car_id'] ?? 0);
    $name  = clean($b['customer_name'] ?? '');
    $email = clean($b['email'] ?? '');
    $phone = clean($b['phone'] ?? '');
    $start = $b['start_date'] ?? '';
    $end   = $b['end_date'] ?? '';

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9+\-\s]{7,15}$/', $phone)) {
        json_out(['error' => 'Please enter a valid name, email and phone number'], 422);
    }
    $d1 = DateTime::createFromFormat('Y-m-d', $start);
    $d2 = DateTime::createFromFormat('Y-m-d', $end);
    if (!$d1 || !$d2) json_out(['error' => 'Please choose valid dates'], 422);
    if ($d1 < new DateTime('today')) json_out(['error' => 'Start date cannot be in the past'], 422);
    if ($d2 < $d1) json_out(['error' => 'End date must be on or after the start date'], 422);

    $days = $d1->diff($d2)->days + 1;           // both days inclusive

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT id, name, price_per_day FROM cars WHERE id = ? FOR UPDATE');
        $stmt->execute([$carId]);
        $car = $stmt->fetch();
        if (!$car) { $pdo->rollBack(); json_out(['error' => 'Car not found'], 404); }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM bookings
                               WHERE car_id = ? AND status IN ('Pending','Confirmed')
                                 AND start_date <= ? AND end_date >= ?");
        $stmt->execute([$carId, $end, $start]);
        if ((int)$stmt->fetchColumn() > 0) {
            $pdo->rollBack();
            json_out(['error' => 'Sorry, this car is already booked for those dates. Try different dates.'], 409);
        }

        $total = $days * (float)$car['price_per_day'];
        $stmt = $pdo->prepare('INSERT INTO bookings (car_id, customer_name, email, phone, start_date, end_date, days, total_price)
                               VALUES (?,?,?,?,?,?,?,?)');
        $stmt->execute([$carId, $name, $email, $phone, $start, $end, $days, $total]);
        $id = (int)$pdo->lastInsertId();
        $pdo->commit();
        resequence_table($pdo, 'bookings');
        json_out(['id' => $id, 'days' => $days, 'total_price' => $total, 'car' => $car['name'], 'message' => 'Booking received'], 201);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        json_out(['error' => 'Could not save booking'], 500);
    }
}

// ---- Everything below is admin only ----
require_admin();

if ($method === 'GET') {
    $rows = $pdo->query('SELECT b.*, c.name AS car_name, c.brand AS car_brand, c.image_url AS car_image, c.type AS car_type, c.color AS car_color
                         FROM bookings b JOIN cars c ON c.id = b.car_id
                         ORDER BY b.id ASC')->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['car_id'] = (int)$r['car_id'];
        $r['days'] = (int)$r['days'];
        $r['total_price'] = (float)$r['total_price'];
    }
    json_out($rows);
}

if ($method === 'PATCH') {                      // change status
    $b = body();
    $status = $b['status'] ?? '';
    if (!in_array($status, ['Pending', 'Confirmed', 'Completed', 'Cancelled'], true)) json_out(['error' => 'Invalid status'], 422);
    $stmt = $pdo->prepare('UPDATE bookings SET status = ? WHERE id = ?');
    $stmt->execute([$status, (int)($b['id'] ?? 0)]);
    json_out(['message' => 'Status updated']);
}

if ($method === 'DELETE') {
    $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = ?');
    $stmt->execute([(int)($_GET['id'] ?? 0)]);
    resequence_table($pdo, 'bookings');
    json_out(['message' => 'Booking deleted']);
}

json_out(['error' => 'Method not allowed'], 405);

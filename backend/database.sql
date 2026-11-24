-- Car Rental System database  (import this file in phpMyAdmin or: mysql -u root < database.sql)
CREATE DATABASE IF NOT EXISTS car_rental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE car_rental;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS admins;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  type VARCHAR(30) NOT NULL,
  transmission VARCHAR(20) NOT NULL DEFAULT 'Manual',
  fuel VARCHAR(20) NOT NULL DEFAULT 'Petrol',
  seats TINYINT NOT NULL DEFAULT 5,
  price_per_day DECIMAL(10,2) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#2F5DA8',
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  car_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_car_dates (car_id, start_date, end_date)
) ENGINE=InnoDB;

-- Default admin  ->  username: admin   password: admin123
INSERT INTO admins (username, password_hash) VALUES ('admin', '$2y$10$7cNTFar0YQA/wckS2iKZgOhoHfkgrEaNPmsD1yTeAWbqJLQGdX5ZW');

-- 10 starting cars
INSERT INTO cars (name, brand, type, transmission, fuel, seats, price_per_day, color, image_url) VALUES
('Swift VXi',          'Maruti Suzuki', 'Hatchback', 'Manual',    'Petrol',   5, 1800.00, '#D7263D', '/images/cars/swift.jpg'),
('City ZX',            'Honda',         'Sedan',     'Automatic', 'Petrol',   5, 2800.00, '#2563EB', '/images/cars/city.jpg'),
('Creta SX',           'Hyundai',       'SUV',       'Automatic', 'Diesel',   5, 3200.00, '#059669', '/images/cars/creta.jpg'),
('Nexon EV',           'Tata',          'SUV',       'Automatic', 'Electric', 5, 3000.00, '#0D9488', '/images/cars/nexon.jpg'),
('Seltos HTX',         'Kia',           'SUV',       'Manual',    'Diesel',   5, 3100.00, '#7C3AED', '/images/cars/seltos.jpg'),
('Thar LX 4x4',        'Mahindra',      'SUV',       'Manual',    'Diesel',   4, 3800.00, '#DC2626', '/images/cars/thar.jpg'),
('Ertiga ZXi',         'Maruti Suzuki', 'MPV',       'Manual',    'Petrol',   7, 2600.00, '#D97706', '/images/cars/ertiga.jpg'),
('Innova Crysta',      'Toyota',        'MPV',       'Manual',    'Diesel',   7, 4200.00, '#475569', '/images/cars/innova.jpg'),
('XUV700 AX7',         'Mahindra',      'SUV',       'Automatic', 'Diesel',   7, 4600.00, '#1E3A8A', '/images/cars/xuv700.png'),
('Fortuner Legender',  'Toyota',        'Luxury SUV','Automatic', 'Diesel',   7, 6500.00, '#B45309', '/images/cars/fortuner.jpg');

-- Sample customer bookings
INSERT INTO bookings (car_id, customer_name, email, phone, start_date, end_date, days, total_price, status) VALUES
(2, 'Akshay', 'workings.tech@gmail.com', '8618109697', '2026-11-23', '2026-11-26', 4, 12800.00, 'Confirmed'),
(1, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', '2026-11-25', '2026-11-28', 4, 7200.00, 'Pending'),
(4, 'Priya Nair', 'priya.nair@outlook.com', '9845012345', '2026-11-27', '2026-11-30', 4, 12400.00, 'Pending'),
(7, 'Siddharth Rao', 'sid.rao@gmail.com', '9900112233', '2026-11-24', '2026-11-29', 6, 27600.00, 'Confirmed');

# Mysuru Drive – Car Rental System
React (Vite) + PHP (PDO) + MySQL

## 1. Requirements
XAMPP / WAMP (Apache + PHP 8+ + MySQL) and Node.js 18+.

## 2. Setup
1. Copy this whole `car-rental` folder into `C:\xampp\htdocs\` (so the API is at
   `http://localhost/car-rental/backend/api/cars.php`).
2. Start **Apache** and **MySQL** in XAMPP.
3. Open phpMyAdmin → *Import* → choose `backend/database.sql` → Go.
   This creates the `car_rental` database, all tables, 10 cars, and the admin account.
4. If your MySQL has a password, edit `backend/config.php`.
5. Frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173

## 3. Admin
http://localhost:5173/admin  →  username `admin`, password `admin123`
- See every customer booking (auto-refreshes every 8 s), change status, delete.
- Add a car / delete a car (changes are written to MySQL immediately).

## 4. Database tables
`admins`, `cars`, `bookings` (bookings → cars via foreign key; deleting a car deletes its bookings).

## 5. Different folder / port?
Edit the `proxy` block in `frontend/vite.config.js`.
Using PHP's built-in server instead: `php -S localhost:8000 -t backend` and set
`target: 'http://localhost:8000'`, `rewrite: p => p.replace(/^\/api/, '/api')`.

## 6. Change the admin password
Run in any PHP: `echo password_hash('newpass', PASSWORD_DEFAULT);`
then `UPDATE admins SET password_hash='...' WHERE username='admin';`

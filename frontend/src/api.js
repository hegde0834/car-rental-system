async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // public
  getCars: () => request('/cars.php'),
  createBooking: (payload) => request('/bookings.php', { method: 'POST', body: JSON.stringify(payload) }),
  // auth
  me: () => request('/auth.php'),
  login: (username, password) => request('/auth.php?action=login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/auth.php?action=logout', { method: 'POST' }),
  // admin
  getBookings: () => request('/bookings.php'),
  setBookingStatus: (id, status) => request('/bookings.php', { method: 'PATCH', body: JSON.stringify({ id, status }) }),
  deleteBooking: (id) => request(`/bookings.php?id=${id}`, { method: 'DELETE' }),
  addCar: (car) => request('/cars.php', { method: 'POST', body: JSON.stringify(car) }),
  deleteCar: (id) => request(`/cars.php?id=${id}`, { method: 'DELETE' }),
};

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
export const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

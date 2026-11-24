import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, inr, fmtDate } from '../api.js';
import { getCarImage, getBodyTypeStyle, getFuelIcon } from '../carUtils.js';

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const EMPTY_CAR = {
  name: '',
  brand: '',
  type: 'Sedan',
  transmission: 'Manual',
  fuel: 'Petrol',
  seats: 5,
  price_per_day: '',
  color: '#2563EB',
  image_url: '',
};

export default function AdminDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(EMPTY_CAR);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [lastSync, setLastSync] = useState(null);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const refresh = useCallback(async () => {
    try {
      const [b, c] = await Promise.all([api.getBookings(), api.getCars()]);
      setBookings(b);
      setCars(c);
      setLastSync(new Date());
    } catch (e) {
      if (e.status === 401) nav('/admin/login', { replace: true });
    }
  }, [nav]);

  // guard + initial load
  useEffect(() => {
    api.me()
      .then((r) => {
        if (!r.loggedIn) return nav('/admin/login', { replace: true });
        setUser(r.username);
        refresh();
      })
      .catch(() => nav('/admin/login', { replace: true }));
  }, [nav, refresh]);

  // auto-refresh so new customer bookings appear without reloading
  useEffect(() => {
    if (!user) return;
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, [user, refresh]);

  const stats = useMemo(
    () => ({
      cars: cars.length,
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      revenue: bookings
        .filter((b) => ['Confirmed', 'Completed'].includes(b.status))
        .reduce((s, b) => s + b.total_price, 0),
    }),
    [cars, bookings]
  );

  const visible = filter === 'All' ? bookings : bookings.filter((b) => b.status === filter);

  const changeStatus = async (id, status) => {
    try {
      await api.setBookingStatus(id, status);
      refresh();
      flash('ok', `Booking #${id} updated to ${status}`);
    } catch (e) {
      flash('err', e.message);
    }
  };

  const removeBooking = async (b) => {
    if (!confirm(`Delete booking #${b.id} for ${b.customer_name}?`)) return;
    try {
      await api.deleteBooking(b.id);
      flash('ok', 'Booking deleted');
      refresh();
    } catch (e) {
      flash('err', e.message);
    }
  };

  const removeCar = async (c) => {
    if (!confirm(`Delete ${c.brand} ${c.name}? Any bookings for this car will be deleted too.`)) return;
    try {
      await api.deleteCar(c.id);
      flash('ok', 'Car deleted');
      refresh();
    } catch (e) {
      flash('err', e.message);
    }
  };

  const addCar = async (e) => {
    e.preventDefault();
    try {
      await api.addCar({ ...form, seats: Number(form.seats), price_per_day: Number(form.price_per_day) });
      setForm(EMPTY_CAR);
      flash('ok', 'New car added to the fleet successfully!');
      refresh();
    } catch (err) {
      flash('err', err.message);
    }
  };

  const logout = async () => {
    await api.logout();
    nav('/admin/login');
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!user) return <p className="muted center-pad">Checking session…</p>;

  return (
    <div className="admin">
      <aside className="side">
        <div className="logo light">
          <span className="logo-mark">🚗</span>
          <span className="logo-title">Mysuru<span className="logo-accent">Drive</span></span>
        </div>
        <div className="admin-user-tag">
          <span className="online-indicator" /> Logged in as <b>{user}</b>
        </div>
        <button className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>
          <span>📋 Customer Bookings</span>
          {stats.pending > 0 && <em className="badge-pulse">{stats.pending}</em>}
        </button>
        <button className={tab === 'cars' ? 'on' : ''} onClick={() => setTab('cars')}>
          <span>🚘 Manage Fleet & Photos</span>
          <span className="badge-count">{stats.cars}</span>
        </button>
        <div className="side-foot">
          <Link to="/" className="btn-view-site">View Website ↗</Link>
          <button className="btn-signout" onClick={logout}>Sign Out</button>
        </div>
      </aside>

      <section className="panel">
        {/* Colorful Metric Cards */}
        <div className="stats-vibrant">
          <div className="stat-box box-purple">
            <div className="stat-top">
              <span>Fleet Inventory</span>
              <span className="stat-bubble">🚘</span>
            </div>
            <b>{stats.cars} Cars</b>
            <small>Active in catalogue</small>
          </div>

          <div className="stat-box box-blue">
            <div className="stat-top">
              <span>Total Bookings</span>
              <span className="stat-bubble">📑</span>
            </div>
            <b>{stats.total}</b>
            <small>All time orders</small>
          </div>

          <div className={`stat-box box-amber ${stats.pending > 0 ? 'pulse-border' : ''}`}>
            <div className="stat-top">
              <span>Needs Attention</span>
              <span className="stat-bubble">⏳</span>
            </div>
            <b>{stats.pending} Pending</b>
            <small>Awaiting confirmation</small>
          </div>

          <div className="stat-box box-emerald">
            <div className="stat-top">
              <span>Total Revenue</span>
              <span className="stat-bubble">💰</span>
            </div>
            <b>{inr(stats.revenue)}</b>
            <small>Confirmed & completed</small>
          </div>
        </div>

        {msg.text && <div className={'toast-vibrant ' + msg.type}>{msg.text}</div>}

        {tab === 'bookings' && (
          <>
            <div className="panel-head">
              <h2>Customer Bookings</h2>
              <div className="filters">
                {['All', ...STATUSES].map((s) => (
                  <button
                    key={s}
                    className={'pill-filter' + (s === filter ? ' active' : '')}
                    onClick={() => setFilter(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <span className="sync">● Live · Synced {lastSync ? lastSync.toLocaleTimeString() : '…'}</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Selected Vehicle</th>
                    <th>Trip Dates</th>
                    <th>Total Price</th>
                    <th>Booking Status</th>
                    <th>Booked At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => {
                    const carPhoto = b.car_image || getCarImage({ name: b.car_name, brand: b.car_brand });
                    const carTypeStyle = getBodyTypeStyle(b.car_type || 'Sedan');
                    return (
                      <tr key={b.id}>
                        <td><span className="badge-id">#{b.id}</span></td>
                        <td>
                          <b style={{ fontSize: 15, display: 'block' }}>👤 {b.customer_name}</b>
                          <small className="muted" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                            <a href={`mailto:${b.email}`} style={{ color: 'inherit' }}>✉️ {b.email}</a>
                            <a href={`tel:${b.phone}`} style={{ color: 'inherit', fontWeight: 700 }}>📞 {b.phone}</a>
                          </small>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="table-car-thumb" style={{ width: 56, height: 40, flexShrink: 0 }}>
                              {carPhoto ? <img src={carPhoto} alt={b.car_name} /> : <span>🚗</span>}
                            </div>
                            <div>
                              <b className="car-tag" style={{ display: 'block' }}>{b.car_brand} {b.car_name}</b>
                              {b.car_type && (
                                <span className="chip chip-table-type" style={{ background: carTypeStyle.gradient, color: carTypeStyle.color, fontSize: 10, padding: '2px 7px', marginTop: 2 }}>
                                  {carTypeStyle.icon} {b.car_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <b>{fmtDate(b.start_date)} ➔ {fmtDate(b.end_date)}</b>
                          <small className="muted" style={{ display: 'block', marginTop: 2 }}>⏱️ {b.days} day{b.days > 1 ? 's' : ''}</small>
                        </td>
                        <td>
                          <b className="price-tag">{inr(b.total_price)}</b>
                        </td>
                        <td>
                          <select
                            className={'status-select status-' + b.status.toLowerCase()}
                            value={b.status}
                            onChange={(e) => changeStatus(b.id, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <small>{new Date(b.created_at.replace(' ', 'T')).toLocaleString('en-IN')}</small>
                        </td>
                        <td>
                          <button className="icon-del" title="Delete booking" onClick={() => removeBooking(b)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty">
                        No bookings matching filter "{filter}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'cars' && (
          <>
            <div className="panel-head">
              <h2>Add New Car to Fleet</h2>
            </div>
            <form className="car-form-vibrant" onSubmit={addCar}>
              <label>
                Model Name
                <input value={form.name} onChange={set('name')} placeholder="e.g. Scorpio-N Z8" required />
              </label>
              <label>
                Brand
                <input value={form.brand} onChange={set('brand')} placeholder="e.g. Mahindra" required />
              </label>
              <label>
                Body Type
                <select value={form.type} onChange={set('type')}>
                  {['Hatchback', 'Sedan', 'SUV', 'MPV', 'Luxury SUV', 'Luxury Sedan'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Transmission
                <select value={form.transmission} onChange={set('transmission')}>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </label>
              <label>
                Fuel
                <select value={form.fuel} onChange={set('fuel')}>
                  {['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label>
                Seats
                <input type="number" min="1" max="20" value={form.seats} onChange={set('seats')} required />
              </label>
              <label>
                Price / Day (₹)
                <input type="number" min="1" value={form.price_per_day} onChange={set('price_per_day')} required />
              </label>
              <label>
                Theme Color Accent
                <input type="color" value={form.color} onChange={set('color')} />
              </label>
              <label className="span2">
                Real Photo URL
                <input
                  value={form.image_url}
                  onChange={set('image_url')}
                  placeholder="e.g. /images/cars/scorpio.jpg or https://…"
                />
              </label>
              <button className="btn btn-vibrant btn-add-car">
                + Add Car To Fleet
              </button>
            </form>

            <div className="panel-head">
              <h2>Fleet Vehicles & Real Photos ({cars.length})</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Car Details</th>
                    <th>Body Type</th>
                    <th>Key Specs</th>
                    <th>Daily Rate</th>
                    <th>Status Today</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((c) => {
                    const photo = getCarImage(c);
                    const typeStyle = getBodyTypeStyle(c.type);
                    return (
                      <tr key={c.id}>
                        <td style={{ width: 90 }}>
                          <div className="table-car-thumb">
                            {photo ? (
                              <img src={photo} alt={c.name} />
                            ) : (
                              <span className="thumb-placeholder" style={{ backgroundColor: c.color }}>🚗</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <b>{c.brand} {c.name}</b>
                          <small className="muted">ID #{c.id} · Accent: <span style={{ color: c.color }}>●</span> {c.color}</small>
                        </td>
                        <td>
                          <span
                            className="chip chip-table-type"
                            style={{ background: typeStyle.gradient, color: typeStyle.color }}
                          >
                            {typeStyle.icon} {c.type}
                          </span>
                        </td>
                        <td>
                          <small className="specs-small">
                            👥 {c.seats} seats · 🕹️ {c.transmission} · {getFuelIcon(c.fuel)} {c.fuel}
                          </small>
                        </td>
                        <td>
                          <b className="price-tag">{inr(c.price_per_day)}</b>
                        </td>
                        <td>
                          {c.rented_now ? (
                            <span className="badge-status-busy">● On Rent</span>
                          ) : (
                            <span className="badge-status-free">● Available</span>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-danger-pill" onClick={() => removeCar(c)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

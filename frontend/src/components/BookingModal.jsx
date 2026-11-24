import { useMemo, useState } from 'react';
import { api, inr } from '../api.js';
import { getCarImage, getBodyTypeStyle, getFuelIcon } from '../carUtils.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function BookingModal({ car, onClose }) {
  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    start_date: today(),
    end_date: today(),
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const photoUrl = getCarImage(car);
  const typeStyle = getBodyTypeStyle(car.type);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const days = useMemo(() => {
    const a = new Date(form.start_date), b = new Date(form.end_date);
    const d = Math.round((b - a) / 86400000) + 1;
    return Number.isFinite(d) && d > 0 ? d : 0;
  }, [form.start_date, form.end_date]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (days < 1) return setError('End date must be on or after the start date');
    setBusy(true);
    try {
      const res = await api.createBooking({ ...form, car_id: car.id });
      setDone(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-colorful" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>

        {done ? (
          <div className="success">
            <div className="tick-glow">✓</div>
            <h2 className="gradient-text">Booking Confirmed!</h2>
            <p>
              Your booking <b>#{done.id}</b> for the <b>{done.car}</b> is saved!
              <br />
              <span className="summary-pill">{done.days} day{done.days > 1 ? 's' : ''} · {inr(done.total_price)}</span>
            </p>
            <p className="muted">Our representative will call your phone to verify delivery details.</p>
            <button className="btn btn-vibrant btn-block" onClick={onClose}>Great, Thank You!</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {photoUrl && (
              <div className="modal-car-preview" style={{ '--tint': car.color }}>
                <img src={photoUrl} alt={car.name} className="modal-car-img" />
                <span className="chip chip-type-vibrant" style={{ background: typeStyle.gradient, color: typeStyle.color }}>
                  {typeStyle.icon} {car.type}
                </span>
              </div>
            )}

            <div className="modal-title-row">
              <div>
                <p className="car-brand">{car.brand}</p>
                <h2>{car.name}</h2>
              </div>
              <div className="modal-price-badge">
                <b>{inr(car.price_per_day)}</b>
                <span>/ day</span>
              </div>
            </div>

            <div className="modal-spec-tags">
              <span>👥 {car.seats} Seats</span>
              <span>🕹️ {car.transmission}</span>
              <span>{getFuelIcon(car.fuel)} {car.fuel}</span>
              <span>✨ 4.9 Rating</span>
            </div>

            <div className="grid2">
              <label>Pick-up Date
                <input
                  type="date"
                  min={today()}
                  value={form.start_date}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({ ...f, start_date: v, end_date: f.end_date < v ? v : f.end_date }));
                  }}
                  required
                />
              </label>
              <label>Return Date
                <input
                  type="date"
                  min={form.start_date}
                  value={form.end_date}
                  onChange={set('end_date')}
                  required
                />
              </label>
            </div>

            <label>Customer Full Name
              <input value={form.customer_name} onChange={set('customer_name')} placeholder="e.g. Ramesh Kumar" required />
            </label>

            <div className="grid2">
              <label>Email Address
                <input type="email" value={form.email} onChange={set('email')} placeholder="name@example.com" required />
              </label>
              <label>Phone Number (10 digits)
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="98765 43210" required />
              </label>
            </div>

            <div className="total-box">
              <div className="total-details">
                <span>Trip Duration: <b>{days} day{days !== 1 ? 's' : ''}</b></span>
                <small className="muted">{days} × {inr(car.price_per_day)} (Inclusive of GST & Insurance)</small>
              </div>
              <div className="total-amount">
                <span>Total Payable</span>
                <strong>{inr(days * car.price_per_day)}</strong>
              </div>
            </div>

            {error && <p className="error">{error}</p>}
            <button className="btn btn-vibrant btn-block" disabled={busy}>
              {busy ? 'Processing Booking…' : `Confirm Booking (${inr(days * car.price_per_day)})`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

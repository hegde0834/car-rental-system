import { useState } from 'react';
import CarIllustration from './CarIllustration.jsx';
import { inr } from '../api.js';
import { getCarImage, getBodyTypeStyle, getFuelIcon } from '../carUtils.js';

export default function CarCard({ car, onBook }) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = getCarImage(car);
  const showPhoto = photoUrl && !imgFailed;
  const typeStyle = getBodyTypeStyle(car.type);

  return (
    <article className="car-card">
      <div className="car-media" style={{ '--tint': car.color || '#2F5DA8' }}>
        <div className="media-overlay" />
        {showPhoto ? (
          <img
            src={photoUrl}
            alt={`${car.brand} ${car.name}`}
            className="car-photo"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <CarIllustration color={car.color || '#2F5DA8'} />
        )}

        <span
          className="chip chip-type-vibrant"
          style={{ background: typeStyle.gradient, color: typeStyle.color }}
        >
          <span>{typeStyle.icon}</span> {car.type}
        </span>

        {car.rented_now ? (
          <span className="chip chip-rented">🔴 On Trip Today</span>
        ) : (
          <span className="chip chip-available">🟢 Available</span>
        )}

        <span className="car-rating-tag">★ 4.9</span>
      </div>

      <div className="car-body">
        <div className="car-header-row">
          <div>
            <p className="car-brand">{car.brand}</p>
            <h3 className="car-title">{car.name}</h3>
          </div>
          <span className="color-indicator" style={{ backgroundColor: car.color }} title={`Theme: ${car.color}`} />
        </div>

        <ul className="specs">
          <li className="spec-item spec-seats">
            <span className="spec-icon">👥</span> {car.seats} Seats
          </li>
          <li className="spec-item spec-trans">
            <span className="spec-icon">🕹️</span> {car.transmission}
          </li>
          <li className="spec-item spec-fuel">
            <span className="spec-icon">{getFuelIcon(car.fuel)}</span> {car.fuel}
          </li>
        </ul>

        <div className="car-perks">
          <span>✓ Unlimited KMs</span>
          <span>✓ Free Cancel</span>
        </div>

        <div className="car-foot">
          <div className="price">
            <strong>{inr(car.price_per_day)}</strong>
            <span>/ day</span>
          </div>
          <button className="btn btn-vibrant" onClick={() => onBook(car)}>
            Book Now ➔
          </button>
        </div>
      </div>
    </article>
  );
}

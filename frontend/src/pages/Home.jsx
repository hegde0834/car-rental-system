import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import CarCard from '../components/CarCard.jsx';
import BookingModal from '../components/BookingModal.jsx';
import { getBodyTypeStyle } from '../carUtils.js';

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('All');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () =>
    api.getCars()
      .then((c) => { setCars(c); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const types = useMemo(() => ['All', ...new Set(cars.map((c) => c.type))], [cars]);
  const shown = cars.filter(
    (c) => (type === 'All' || c.type === type) && `${c.brand} ${c.name}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      {/* Top Banner */}
      <div className="top-announcement">
        <span>🎉 Special Weekend Offer: Get 10% OFF on all 3+ days road trips! Code: <b>MYSURU10</b></span>
      </div>

      {/* Main Navigation */}
      <header className="nav">
        <a href="#top" className="logo">
          <span className="logo-mark">🚗</span>
          <span className="logo-title">Mysuru<span className="logo-accent">Drive</span></span>
        </a>
        <nav>
          <a href="#fleet" className="nav-link">Fleet & Rates</a>
          <a href="#features" className="nav-link">Why Us</a>
          <a href="#routes" className="nav-link">Top Routes</a>
          <a href="#how" className="nav-link">How It Works</a>
          <Link to="/admin" className="btn btn-nav-admin">Admin Portal</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            <span>Karnataka's Top Rated Self-Drive Rental</span>
          </div>
          <h1>
            Hand Over The Keys To Your Next <span className="gradient-text">Colorful Adventure</span>
          </h1>
          <p className="hero-desc">
            Explore heritage palaces, misty Coorg hills, Ooty curves, or sunlit Gokarna beaches.
            Choose your car with authentic photos, verified specs, zero security deposit, and transparent pricing.
          </p>
          <div className="hero-actions">
            <a href="#fleet" className="btn btn-vibrant btn-lg">
              Explore Fleet ({cars.length || 10} Cars) ➔
            </a>
            <a href="#how" className="btn btn-outline-light btn-lg">
              How Booking Works
            </a>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-item">
              <span className="trust-star">★★★★★</span>
              <span>4.9 / 5 Rating (2,400+ reviews)</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span>🛡️ 100% Comprehensive Insurance</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Card */}
        <div className="hero-card-container">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="route-header-pill">Popular Scenic Circuit</div>
              <div className="route">
                <span className="badge-loc loc-1">Mysuru</span>
                <i className="route-line" />
                <span className="badge-loc loc-2">Coorg</span>
                <i className="route-line" />
                <span className="badge-loc loc-3">Ooty</span>
                <i className="route-line" />
                <span className="badge-loc loc-4">Wayanad</span>
              </div>
            </div>

            <div className="stat-cards-grid">
              <div className="stat-card stat-cyan">
                <span className="stat-icon">🚘</span>
                <dt>{cars.length || 11}</dt>
                <dd>Cars Ready</dd>
              </div>
              <div className="stat-card stat-emerald">
                <span className="stat-icon">🕒</span>
                <dt>24×7</dt>
                <dd>Roadside Care</dd>
              </div>
              <div className="stat-card stat-amber">
                <span className="stat-icon">₹</span>
                <dt>₹0</dt>
                <dd>Zero Deposit</dd>
              </div>
              <div className="stat-card stat-pink">
                <span className="stat-icon">⭐</span>
                <dt>4.9★</dt>
                <dd>Trip Rating</dd>
              </div>
            </div>

            <div className="hero-card-footer">
              <span>📍 Pickup: Mysuru Palace / Railway Station / Doorstep</span>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Catalog Section */}
      <main className="wrap" id="fleet">
        <div className="section-head">
          <span className="section-kicker">OUR PREMIUM FLEET</span>
          <h2>Find Your Perfect Ride</h2>
          <p className="section-sub">
            All vehicles are company maintained, sanitized before every trip, and include unlimited kilometers.
          </p>
        </div>

        {/* Toolbar & Filters */}
        <div className="toolbar-vibrant">
          <div className="filters-container">
            {types.map((t) => {
              const style = getBodyTypeStyle(t);
              const isActive = t === type;
              return (
                <button
                  key={t}
                  className={`pill-vibrant ${isActive ? 'active' : ''}`}
                  style={isActive ? { background: style.gradient, borderColor: 'transparent', color: '#fff' } : {}}
                  onClick={() => setType(t)}
                >
                  <span className="pill-icon">{style.icon}</span>
                  <span>{t}</span>
                  {t === 'All' ? (
                    <span className="pill-count">{cars.length}</span>
                  ) : (
                    <span className="pill-count">{cars.filter((c) => c.type === t).length}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by car name, brand, or model…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button className="search-clear" onClick={() => setQ('')}>✕</button>
            )}
          </div>
        </div>

        {/* Dynamic Cars Grid */}
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading our fleet of cars…</p>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {!loading && !error && shown.length === 0 && (
          <div className="empty-fleet">
            <span className="empty-icon">🚗🔍</span>
            <h3>No cars found matching "{q}"</h3>
            <p className="muted">Try adjusting your filters or search keywords.</p>
            <button className="btn btn-vibrant" onClick={() => { setQ(''); setType('All'); }}>
              Reset Filters
            </button>
          </div>
        )}

        <div className="grid">
          {shown.map((c) => (
            <CarCard key={c.id} car={c} onBook={setSelected} />
          ))}
        </div>
      </main>

      {/* Feature Highlights Section */}
      <section className="features-section wrap" id="features">
        <div className="section-head">
          <span className="section-kicker">WHY CHOOSE MYSURU DRIVE</span>
          <h2>Rent With Total Peace of Mind</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card feature-coral">
            <div className="feature-icon-wrapper">🚀</div>
            <h3>Instant Booking</h3>
            <p>Lock your car in 60 seconds with no paperwork hassles or physical counters.</p>
          </div>
          <div className="feature-card feature-indigo">
            <div className="feature-icon-wrapper">✨</div>
            <h3>Pristine Clean Cars</h3>
            <p>Full interior detailing and 25-point safety check done before every handoff.</p>
          </div>
          <div className="feature-card feature-emerald">
            <div className="feature-icon-wrapper">🛣️</div>
            <h3>Unlimited Kilometers</h3>
            <p>Drive wherever your heart desires across Karnataka and neighboring states with no per-KM anxiety.</p>
          </div>
          <div className="feature-card feature-amber">
            <div className="feature-icon-wrapper">🛠️</div>
            <h3>24×7 Roadside Assist</h3>
            <p>Free on-road support across Mysore, Bangalore, Hassan, Kodagu, and Nilgiris.</p>
          </div>
        </div>
      </section>

      {/* Popular Scenic Routes Section */}
      <section className="routes-section wrap" id="routes">
        <div className="section-head">
          <span className="section-kicker">ROAD TRIP INSPIRATION</span>
          <h2>Popular Road Trips Starting From Mysuru</h2>
        </div>
        <div className="routes-grid">
          <div className="route-card route-card-coorg">
            <div className="route-badge-float">120 km · ~3 hrs</div>
            <h3>Mysuru ➔ Coorg</h3>
            <p>Coffee plantations, Abbey Falls, and Raja's Seat. Best with: <b>Creta SX or Thar 4x4</b>.</p>
          </div>
          <div className="route-card route-card-ooty">
            <div className="route-badge-float">125 km · ~3.5 hrs</div>
            <h3>Mysuru ➔ Bandipur ➔ Ooty</h3>
            <p>36 hairpin bends and wildlife safaris. Best with: <b>XUV700 or Fortuner</b>.</p>
          </div>
          <div className="route-card route-card-wayanad">
            <div className="route-badge-float">140 km · ~3.5 hrs</div>
            <h3>Mysuru ➔ Wayanad</h3>
            <p>Lush rainforests, Chembra Peak, and Banasura Dam. Best with: <b>Innova or Ertiga</b>.</p>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="wrap how" id="how">
        <div className="section-head">
          <span className="section-kicker">SIMPLE & TRANSPARENT</span>
          <h2>Three Steps To Hit The Road</h2>
        </div>
        <ol className="steps-colorful">
          <li className="step-card step-card-1">
            <span className="step-badge">01</span>
            <b>Pick Your Ride</b>
            <span>Browse photos, compare specs, transmission, and daily rates for your group size.</span>
          </li>
          <li className="step-card step-card-2">
            <span className="step-badge">02</span>
            <b>Select Dates</b>
            <span>Choose pick-up and return dates. The total auto-updates with full clarity.</span>
          </li>
          <li className="step-card step-card-3">
            <span className="step-badge">03</span>
            <b>Get The Keys</b>
            <span>We confirm your booking immediately and deliver your car right on time.</span>
          </li>
        </ol>
      </section>

      {/* Footer */}
      <footer className="footer-colorful">
        <div className="footer-wrap">
          <div className="footer-col-main">
            <div className="logo light">
              <span className="logo-mark">🚗</span>
              <span className="logo-title">Mysuru<span className="logo-accent">Drive</span></span>
            </div>
            <p className="footer-about">
              Karnataka's premier self-drive car rental platform. Providing transparent, reliable, and premium vehicles for unforgettable memories.
            </p>
            <div className="footer-contact-pills">
              <span>📞 +91 98765 43210</span>
              <span>📍 Sayyaji Rao Road, Near Mysuru Palace, Mysuru</span>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#fleet">Our Fleet</a>
            <a href="#features">Why Choose Us</a>
            <a href="#routes">Popular Routes</a>
            <a href="#how">How It Works</a>
          </div>
          <div className="footer-col">
            <h4>Administration</h4>
            <Link to="/admin">Admin Dashboard</Link>
            <Link to="/admin/login">Staff Login</Link>
            <span className="footer-badge-secure">🔒 256-Bit SSL Encrypted</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Mysuru Drive Systems · Built with Pride in Karnataka.</p>
        </div>
      </footer>

      {/* Booking Modal */}
      {selected && (
        <BookingModal
          car={selected}
          onClose={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

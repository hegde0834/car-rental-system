// Real car photo mapping and White + Red + Black utilities

const DEFAULT_CAR_PHOTOS = {
  swift: '/images/cars/swift.jpg',
  city: '/images/cars/city.jpg',
  creta: '/images/cars/creta.jpg',
  nexon: '/images/cars/nexon.jpg',
  seltos: '/images/cars/seltos.jpg',
  thar: '/images/cars/thar.jpg',
  ertiga: '/images/cars/ertiga.jpg',
  innova: '/images/cars/innova.jpg',
  xuv700: '/images/cars/xuv700.png',
  fortuner: '/images/cars/fortuner.jpg',
  wagonr: '/images/cars/wagonr.jpg',
};

export function getCarImage(car) {
  if (car.image_url && car.image_url.trim()) {
    return car.image_url.trim();
  }
  const name = (car.name || '').toLowerCase();
  for (const [key, path] of Object.entries(DEFAULT_CAR_PHOTOS)) {
    if (name.includes(key)) {
      return path;
    }
  }
  return null;
}

export const BODY_TYPE_STYLES = {
  All: {
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    bg: '#dc2626',
    color: '#ffffff',
    icon: '⚡',
  },
  Hatchback: {
    gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
    bg: '#e11d48',
    color: '#ffffff',
    icon: '🏎️',
  },
  Sedan: {
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    bg: '#0f172a',
    color: '#ffffff',
    icon: '🚙',
  },
  SUV: {
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    bg: '#dc2626',
    color: '#ffffff',
    icon: '⛰️',
  },
  MPV: {
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    bg: '#1e293b',
    color: '#ffffff',
    icon: '🚐',
  },
  'Luxury SUV': {
    gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
    bg: '#991b1b',
    color: '#ffffff',
    icon: '👑',
  },
  'Luxury Sedan': {
    gradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
    bg: '#090d16',
    color: '#ffffff',
    icon: '💎',
  },
};

export function getBodyTypeStyle(type) {
  return BODY_TYPE_STYLES[type] || {
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    bg: '#dc2626',
    color: '#ffffff',
    icon: '🚘',
  };
}

export function getFuelIcon(fuel) {
  const f = (fuel || '').toLowerCase();
  if (f.includes('electric')) return '⚡';
  if (f.includes('diesel')) return '⛽';
  if (f.includes('cng')) return '🌱';
  if (f.includes('hybrid')) return '🔋';
  return '⛽';
}

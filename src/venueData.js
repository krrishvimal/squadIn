// Database of verified public venues (0 mock entries for clean production)
export const VERIFIED_VENUES = [];

export const PASSION_TO_CATEGORY_MAP = {
  '☕ Specialty Coffee': 'cafe',
  '🍕 Food Walks': 'cafe',
  '🏸 Badminton': 'sports',
  '🏃 Running 5K': 'sports',
  '🎭 Standup Comedy': 'comedy',
  '🎬 Indie Cinema': 'comedy',
  '🏺 Pottery & Art': 'arts',
  '🥾 Weekend Treks': 'hike',
  '🎵 Concerts & Gigs': 'concert',
  '💻 Tech & Startups': 'other'
};

// Major Indian Metro & Tech Hub Coordinates
export const INDIAN_CITIES = [
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, aliases: ['bangalore', 'bengaluru', 'koramangala', 'indiranagar', 'hsr', 'whitefield', 'bellandur', 'jayanagar'] },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, aliases: ['mumbai', 'bombay', 'thane', 'navi mumbai', 'bandra', 'andheri', 'powai', 'bkc', 'dadar'] },
  { name: 'Delhi-NCR', lat: 28.6139, lng: 77.2090, aliases: ['delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida', 'faridabad', 'ghaziabad', 'south delhi'] },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, aliases: ['pune', 'poona', 'koregaon park', 'viman nagar', 'wakad', 'baner', 'hinjawadi', 'kothrud'] },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, aliases: ['hyderabad', 'secunderabad', 'gachibowli', 'hitec city', 'jubilee hills', 'banjara hills', 'madhapur'] },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, aliases: ['chennai', 'madras', 'adyar', 'velachery', 'anna nagar', 'omr', 'ecr'] },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, aliases: ['kolkata', 'calcutta', 'salt lake', 'new town', 'park street', 'howrah'] },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, aliases: ['ahmedabad', 'gandhinagar', 'sg highway', 'vastrapur', 'bodakdev'] },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, aliases: ['jaipur', 'c-scheme', 'malviya nagar', 'vaishali nagar', 'mansarovar'] },
  { name: 'Goa', lat: 15.2993, lng: 74.1240, aliases: ['goa', 'panaji', 'panjim', 'anjuna', 'candolim', 'calangute', 'baga', 'margao'] },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, aliases: ['chandigarh', 'mohali', 'panchkula'] }
];

// Haversine Distance Calculator (In Kilometers)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

// Automatically detect the closest Indian city based on live GPS
export function detectClosestCity(lat, lng) {
  if (!lat || !lng) return 'Bengaluru';
  let closestCity = 'Bengaluru';
  let minDistance = Infinity;

  for (const city of INDIAN_CITIES) {
    const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (dist !== null && dist < minDistance) {
      minDistance = dist;
      closestCity = city.name;
    }
  }

  return closestCity;
}

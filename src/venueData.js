// Realistic database of top verified public venues in Indian Metros
export const VERIFIED_VENUES = [
  // Bengaluru
  { name: 'Third Wave Coffee, 4th Block', neighborhood: 'Koramangala, Bengaluru', city: 'Bengaluru', lat: 12.9344, lng: 77.6288, type: 'cafe' },
  { name: 'Blue Tokai Coffee Roasters', neighborhood: '12th Main, Indiranagar, Bengaluru', city: 'Bengaluru', lat: 12.9719, lng: 77.6412, type: 'cafe' },
  { name: 'Araku Coffee Flagship', neighborhood: '100ft Road, Indiranagar, Bengaluru', city: 'Bengaluru', lat: 12.9698, lng: 77.6395, type: 'cafe' },
  { name: 'Clay Station Pottery Studio', neighborhood: 'HSR Layout Sector 3, Bengaluru', city: 'Bengaluru', lat: 12.9121, lng: 77.6446, type: 'arts' },
  { name: 'Play Arena Sports Complex', neighborhood: 'Sarjapur Road, Bengaluru', city: 'Bengaluru', lat: 12.9056, lng: 77.6742, type: 'sports' },
  { name: 'Cubbon Park Metro Gate 2', neighborhood: 'Lavelle Road, Bengaluru', city: 'Bengaluru', lat: 12.9738, lng: 77.5960, type: 'sports' },
  { name: 'Windmills Craftworks', neighborhood: 'EPIP Zone, Whitefield, Bengaluru', city: 'Bengaluru', lat: 12.9818, lng: 77.7289, type: 'concert' },
  { name: 'The Board Game Den & Comedy Club', neighborhood: 'BTM Layout 2nd Stage, Bengaluru', city: 'Bengaluru', lat: 12.9166, lng: 77.6101, type: 'comedy' },

  // Mumbai
  { name: 'Subko Coffee Roasters & Bakehouse', neighborhood: 'Bandra West, Mumbai', city: 'Mumbai', lat: 19.0596, lng: 72.8295, type: 'cafe' },
  { name: 'The Habitat Comedy & Music Cafe', neighborhood: 'Pali Hill, Khar West, Mumbai', city: 'Mumbai', lat: 19.0700, lng: 72.8360, type: 'comedy' },
  { name: 'Dribble Football & Badminton Turf', neighborhood: 'Andheri West, Mumbai', city: 'Mumbai', lat: 19.1363, lng: 72.8277, type: 'sports' },
  { name: 'Pizza Express / The Bay Club', neighborhood: 'BKC, Mumbai', city: 'Mumbai', lat: 19.0657, lng: 72.8682, type: 'cafe' },

  // Delhi-NCR
  { name: 'Cyber Hub Amphitheatre & Social', neighborhood: 'DLF Cyber City, Gurgaon', city: 'Delhi-NCR', lat: 28.4952, lng: 77.0895, type: 'concert' },
  { name: 'Blue Tokai Cafe & Roastery', neighborhood: 'Galleria Market, DLF Phase 4, Gurgaon', city: 'Delhi-NCR', lat: 28.4682, lng: 77.0818, type: 'cafe' },
  { name: 'Lodhi Garden Main Gate', neighborhood: 'Lodhi Road, New Delhi', city: 'Delhi-NCR', lat: 28.5933, lng: 77.2197, type: 'sports' },

  // Pune
  { name: 'The Daily All Day Cafe', neighborhood: 'Koregaon Park, Pune', city: 'Pune', lat: 18.5362, lng: 73.8940, type: 'cafe' },
  { name: 'High Spirits Cafe & Live Venue', neighborhood: 'Koregaon Park, Pune', city: 'Pune', lat: 18.5390, lng: 73.8990, type: 'concert' }
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

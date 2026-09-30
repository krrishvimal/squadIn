import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VERIFIED_VENUES } from '../venueData';
import { MapPinPicker } from './MapPinPicker';
import { X, Sparkles, Users, MapPin, Calendar, Plus, Minus, ShieldCheck, CheckCircle2, Tag } from 'lucide-react';

const CATEGORIES = [
  { id: 'cafe', label: 'Cafe & Dinner', icon: '☕', defaultCap: 4, desc: 'Coffee, brunch, or casual dinners' },
  { id: 'sports', label: 'Sports & Run', icon: '🏸', defaultCap: 4, desc: 'Badminton doubles, 5K morning run' },
  { id: 'concert', label: 'Concerts & Gigs', icon: '🎵', defaultCap: 6, desc: 'Music festivals, live gigs, music nights' },
  { id: 'comedy', label: 'Standup & Comedy', icon: '🎭', defaultCap: 4, desc: 'Standup comedy trials, open mics, shows' },
  { id: 'arts', label: 'Workshops', icon: '🏺', defaultCap: 5, desc: 'Pottery, art workshops, book reading' },
  { id: 'hike', label: 'Treks & Walks', icon: '🥾', defaultCap: 8, desc: 'Weekend day treks & heritage walks' },
  { id: 'other', label: 'Other Activities', icon: '✨', defaultCap: 4, desc: 'IPL watchparty, grocery run, shopping, movies' },
];

export const CreatePlanModal = () => {
  const { showCreateModal, setShowCreateModal, createPlan, selectedCity, userCoords } = useApp();

  const [title, setTitle] = useState('');
  const [selectedCat, setSelectedCat] = useState('cafe');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [targetCapacity, setTargetCapacity] = useState(4); // Host custom capacity!
  const [venueSearch, setVenueSearch] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [pinnedLat, setPinnedLat] = useState(userCoords?.lat || 12.9344);
  const [pinnedLng, setPinnedLng] = useState(userCoords?.lng || 77.6288);
  const [dateText, setDateText] = useState('This Saturday, 5:00 PM');
  const [description, setDescription] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);

  if (!showCreateModal) return null;

  // Filter verified venues matching user search or city
  const filteredVenues = VERIFIED_VENUES.filter(v => 
    v.city.toLowerCase() === selectedCity.toLowerCase() ||
    v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    v.neighborhood.toLowerCase().includes(venueSearch.toLowerCase())
  );

  const handleCategorySelect = (cat) => {
    setSelectedCat(cat.id);
    setTargetCapacity(cat.defaultCap);
  };

  const handleSelectVenue = (venue) => {
    setVenueSearch(venue.name);
    setNeighborhood(venue.neighborhood);
    if (venue.lat && venue.lng) {
      setPinnedLat(venue.lat);
      setPinnedLng(venue.lng);
    }
    setShowVenueSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !venueSearch.trim()) {
      alert('Please provide a title and venue name.');
      return;
    }

    const catObj = CATEGORIES.find(c => c.id === selectedCat);
    const categoryLabel = selectedCat === 'other' && customCategoryName.trim()
      ? customCategoryName.trim()
      : (catObj ? catObj.label : 'Hangout');

    createPlan({
      title: title.trim(),
      category: selectedCat,
      categoryLabel: categoryLabel,
      targetCapacity: targetCapacity, // Custom capacity chosen by host
      city: selectedCity,
      venueName: venueSearch.trim(),
      venueLat: pinnedLat,
      venueLng: pinnedLng,
      neighborhood: neighborhood.trim() || `${selectedCity}`,
      dateText: dateText.trim(),
      description: description.trim() || 'Excited to hang out and do something fun together in a small group!',
      womenOnly: womenOnly
    });

    // Reset form state for next plan creation
    setTitle('');
    setCustomCategoryName('');
    setVenueSearch('');
    setNeighborhood('');
    setDescription('');
    setWomenOnly(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-espresso">Post a Weekend Plan</h2>
              <p className="text-[10px] text-stone-500 font-medium">You are the host · Free to create & curate</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(false)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
          
          {/* Activity Category Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              1. Choose Activity Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedCat === cat.id
                      ? 'bg-amber-500 text-espresso font-extrabold border-amber-600 shadow-sm scale-[1.02]'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <div className="mt-1">
                    <div className="text-[10.5px] font-bold leading-tight">{cat.label}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* If 'Other' is selected, show custom tag input */}
            {selectedCat === 'other' && (
              <div className="mt-2.5 p-3 bg-amber-50/80 rounded-xl border border-amber-200 animate-fade-in">
                <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center gap-1">
                  <Tag size={12} className="text-amber-700" />
                  <span>Specify Custom Activity (e.g. "IPL Match Screening", "Grocery Run", "Movie Night"):</span>
                </label>
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. IPL Screening / Grocery Shopping / Board Games"
                  className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:border-amber-600 font-semibold text-stone-800"
                />
              </div>
            )}
          </div>

          {/* Activity Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              2. Plan Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. RCB vs CSK Match Screening & Wings @ Social"
              className="w-full text-xs font-semibold p-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          {/* Host Custom Capacity Stepper */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  3. How many people do you want?
                </label>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Host choice (You decide the exact crew size)
                </p>
              </div>

              <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setTargetCapacity(prev => Math.max(2, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-sm shadow-sm"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-extrabold text-espresso min-w-[24px] text-center">
                  {targetCapacity}
                </span>
                <button
                  type="button"
                  onClick={() => setTargetCapacity(prev => Math.min(12, prev + 1))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-sm shadow-sm"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Hybrid Meeting Location / Venue */}
          <div className="relative space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                4. Meetup Location / Venue
              </label>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck size={11} /> Public & Safe Space
              </span>
            </div>

            {/* Safety Micro-Copy Guideline */}
            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-stone-700 text-[11px] leading-snug">
              <span className="font-extrabold text-amber-950">💡 Safety Standard:</span> Meetups must happen in public spaces (cafes, turfs, parks, malls). Private residences are strictly discouraged.
            </div>

            {/* Input field */}
            <div className="relative">
              <input
                type="text"
                required
                value={venueSearch}
                onFocus={() => setShowVenueSuggestions(true)}
                onChange={(e) => {
                  setVenueSearch(e.target.value);
                  setShowVenueSuggestions(true);
                }}
                placeholder="Type any cafe, turf, park or landmark (e.g. Third Wave Coffee, Decathlon, Cubbon Park)..."
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500 shadow-sm font-medium"
              />
              <MapPin size={14} className="absolute left-2.5 top-3 text-stone-400" />
            </div>

            {/* Quick popular chips in selected city */}
            <div className="pt-1">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Popular Spots in {selectedCity} (Tap to autofill):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VERIFIED_VENUES.filter(v => v.city.toLowerCase() === selectedCity.toLowerCase()).slice(0, 4).map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectVenue(v)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 text-stone-700 transition-colors"
                  >
                    📍 {v.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions Dropdown if searching */}
            {showVenueSuggestions && venueSearch.length > 1 && filteredVenues.length > 0 && (
              <div className="absolute top-[88px] left-0 right-0 bg-white rounded-xl shadow-2xl border border-stone-200 max-h-44 overflow-y-auto z-30 p-1">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2.5 py-1">
                  Verified Matches:
                </div>
                {filteredVenues.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectVenue(v)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 flex items-start gap-2 text-xs transition-colors"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-stone-800">{v.name}</div>
                      <div className="text-[10px] text-stone-400">{v.neighborhood}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Interactive Leaflet Pin Drop Map */}
            <div className="pt-2">
              <MapPinPicker
                lat={pinnedLat}
                lng={pinnedLng}
                venueLabel={venueSearch.trim() || 'Selected Spot'}
                userCoords={userCoords}
                onLocationChange={(newLat, newLng) => {
                  setPinnedLat(newLat);
                  setPinnedLng(newLng);
                }}
              />
            </div>
          </div>

          {/* Area / Neighborhood */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              5. Area / Neighborhood
            </label>
            <input
              type="text"
              required
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="e.g. 4th Block, Koramangala, Bengaluru"
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              6. Date & Time
            </label>
            <input
              type="text"
              required
              value={dateText}
              onChange={(e) => setDateText(e.target.value)}
              placeholder="e.g. This Saturday, 5:00 PM"
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              7. Short Note for Applicants
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what to expect (e.g. 'Catching the match together, bill split equally')..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Women-Only Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200">
            <div>
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <span>🚺</span> Women-Only Plan
              </div>
              <p className="text-[10px] text-rose-700 mt-0.5">
                Only verified female members can view & request to join.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={womenOnly}
                onChange={(e) => setWomenOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 sticky bottom-0 bg-[#FDFBF7]">
            <button
              type="submit"
              className="w-full py-3.5 bg-espresso hover:bg-stone-800 text-cream rounded-2xl font-extrabold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span>Publish Plan to {selectedCity} Feed (Free)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

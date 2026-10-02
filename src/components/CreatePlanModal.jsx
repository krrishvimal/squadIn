import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Users, MapPin, Calendar, Plus, Minus, ShieldCheck, CheckCircle2, Tag } from 'lucide-react';

const CATEGORIES = [
  { id: 'cafe', label: 'Cafe & Dinner', icon: '☕', defaultCap: 4, desc: 'Coffee, brunch, or casual dinners', baseBg: 'bg-violet-50', baseBorder: 'border-violet-200' },
  { id: 'sports', label: 'Sports & Run', icon: '🏸', defaultCap: 4, desc: 'Badminton doubles, 5K morning run', baseBg: 'bg-emerald-50', baseBorder: 'border-emerald-200' },
  { id: 'concert', label: 'Concerts & Gigs', icon: '🎵', defaultCap: 6, desc: 'Music festivals, live gigs, music nights', baseBg: 'bg-orange-50', baseBorder: 'border-orange-200' },
  { id: 'comedy', label: 'Standup & Comedy', icon: '🎭', defaultCap: 4, desc: 'Standup comedy trials, open mics, shows', baseBg: 'bg-yellow-50', baseBorder: 'border-yellow-200' },
  { id: 'arts', label: 'Workshops', icon: '🏺', defaultCap: 5, desc: 'Pottery, art workshops, book reading', baseBg: 'bg-purple-50', baseBorder: 'border-purple-200' },
  { id: 'hike', label: 'Treks & Walks', icon: '🥾', defaultCap: 8, desc: 'Weekend day treks & heritage walks', baseBg: 'bg-green-50', baseBorder: 'border-green-200' },
  { id: 'other', label: 'Other Activities', icon: '✨', defaultCap: 4, desc: 'IPL watchparty, grocery run, shopping, movies', baseBg: 'bg-pink-50', baseBorder: 'border-pink-200' },
];

const TIME_OPTIONS = [
  { label: '🌅 Morning', value: '10:00 AM' },
  { label: '☀️ Afternoon', value: '2:00 PM' },
  { label: '🌆 Evening', value: '5:00 PM', default: true },
  { label: '🌙 Night', value: '8:00 PM' }
];

const getNextSaturday = () => {
  const today = new Date();
  const daysUntilSat = (6 - today.getDay() + 7) % 7 || 7;
  const nextSat = new Date(today);
  nextSat.setDate(today.getDate() + daysUntilSat);
  return nextSat.toISOString().split('T')[0];
};

export const CreatePlanModal = () => {
  const { showCreateModal, setShowCreateModal, createPlan, selectedCity, userCoords } = useApp();

  const [title, setTitle] = useState('');
  const [selectedCat, setSelectedCat] = useState('cafe');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [venueSearch, setVenueSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(getNextSaturday());
  const [selectedTime, setSelectedTime] = useState('5:00 PM');
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const [targetCapacity, setTargetCapacity] = useState(4); // Host custom capacity!
  const [neighborhood, setNeighborhood] = useState('');
  const [description, setDescription] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);

  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showCreateModal]);

  if (!showCreateModal) return null;

  const handleCategorySelect = (cat) => {
    setSelectedCat(cat.id);
    setTargetCapacity(cat.defaultCap);
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

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
    const finalDateText = `${formattedDate}, ${selectedTime}`;

    const defaultLat = userCoords?.lat || 18.5204;
    const defaultLng = userCoords?.lng || 73.8567;

    createPlan({
      title: title.trim(),
      category: selectedCat,
      categoryLabel: categoryLabel,
      targetCapacity: targetCapacity, // Custom capacity chosen by host
      city: selectedCity,
      venueName: venueSearch.trim(),
      venueLat: defaultLat,
      venueLng: defaultLng,
      neighborhood: neighborhood.trim() || `${selectedCity}`,
      dateText: finalDateText,
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
    setSelectedDate(getNextSaturday());
    setSelectedTime('5:00 PM');
    setShowMoreDetails(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 w-screen h-[100dvh] overflow-hidden animate-fade-in">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 pb-2 sm:pb-0">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-[#FDFBF7] sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">📋 Post Your Weekend Plan ✨</h2>
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
                      ? `${cat.baseBg} ring-2 ring-amber-400 border-amber-400 shadow-sm scale-[1.02]`
                      : `${cat.baseBg} ${cat.baseBorder} hover:border-stone-300`
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <div className="mt-1">
                    <div className="text-[10.5px] font-bold leading-tight text-stone-700">{cat.label}</div>
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
              className="w-full text-xs font-semibold p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500 shadow-sm font-medium text-stone-800"
            />
          </div>

          {/* Venue / Location */}
          <div className="relative space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                3. Meetup Location / Venue
              </label>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck size={11} /> Public & Safe Space
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-stone-700 text-[11px] leading-snug">
              <span className="font-extrabold text-amber-950">💡 Safety Standard:</span> Meetups must happen in public spaces (cafes, turfs, parks, malls). Private residences are strictly discouraged.
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={venueSearch}
                onChange={(e) => setVenueSearch(e.target.value)}
                placeholder="e.g. Third Wave Coffee, Decathlon, Cubbon Park, Blue Tokai..."
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500 shadow-sm font-medium text-stone-800 font-medium"
              />
              <MapPin size={14} className="absolute left-2.5 top-3 text-stone-400" />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              4. Date & Time
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500 font-semibold text-stone-700 shadow-sm"
              />
              <div className="flex-1 relative">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full appearance-none text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500 font-semibold text-stone-700 shadow-sm pr-8"
                >
                  {TIME_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                  ))}
                  <option value="custom">Other Time</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-500">
                  <Calendar size={14} />
                </div>
              </div>
            </div>
            
            {/* Quick Time Pills */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    selectedTime === opt.value
                      ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom time input if selected */}
          {selectedTime === 'custom' && (
            <div className="mt-2 animate-fade-in">
               <input
                 type="time"
                 onChange={(e) => setSelectedTime(e.target.value)}
                 className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500 font-semibold text-stone-700 shadow-sm"
               />
            </div>
          )}

          {/* More Details Toggle */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="flex items-center justify-center w-full gap-2 py-2 text-xs font-semibold text-stone-500 hover:text-stone-700 transition-colors"
            >
              <span>⚙️ More details (optional)</span>
            </button>
          </div>

          {/* More Details Collapsed Section */}
          <div className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${showMoreDetails ? 'max-h-[800px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
            
            {/* Host Custom Capacity Stepper */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Crew Size Limit
                  </label>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    How many people do you want?
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

            {/* Area / Neighborhood */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Area / Neighborhood
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. 4th Block, Koramangala, Bengaluru"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Short Note for Applicants
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
          </div>

          {/* Submit CTA */}
          <div className="pt-2 sticky bottom-0 bg-[#FDFBF7]">
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 text-stone-900 rounded-xl font-extrabold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Publish Plan to {selectedCity} Feed (Free)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

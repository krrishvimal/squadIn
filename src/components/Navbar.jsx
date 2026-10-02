import React from 'react';
import { useApp } from '../context/AppContext';
import { INDIAN_CITIES } from '../venueData';
import { MapPin, ShieldCheck, Plus, Sparkles, ChevronDown, UserCheck, Navigation } from 'lucide-react';

export const Navbar = () => {
  const {
    selectedCity,
    setSelectedCity,
    currentUser,
    setActiveTab,
    setShowCreateModal,
    setShowGuidelinesModal,
    requestLiveLocation,
    isLocating,
    userCoords,
    requireVerification
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b-2 border-stone-200/80 px-3 sm:px-4 py-2.5">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand & City Selector */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            onClick={() => setActiveTab('explore')}
            className="w-9 h-9 rounded-2xl bg-amber-400 border-2 border-stone-800 flex items-center justify-center text-stone-900 font-black shadow-[2px_2px_0px_#1c1917] cursor-pointer hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
          >
            <span className="text-lg">⚡</span>
          </div>
          
          <div className="min-w-0 flex items-center gap-2">
            <span 
              onClick={() => setActiveTab('explore')} 
              className="font-black text-base sm:text-lg tracking-tight text-stone-900 cursor-pointer hidden xs:inline"
            >
              SquadIn
            </span>
            
            {/* City Switcher Bubble Pill */}
            <div className="flex items-center gap-1 bg-white border-2 border-stone-800/80 px-2.5 py-1 rounded-2xl shadow-xs text-xs font-black text-stone-800">
              <span className="text-xs">📍</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-stone-900 font-black focus:outline-none cursor-pointer text-xs truncate max-w-[90px] sm:max-w-none"
              >
                {INDIAN_CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={() => requestLiveLocation()}
                disabled={isLocating}
                className="p-0.5 text-stone-400 hover:text-amber-700 transition-colors flex-shrink-0 cursor-pointer"
                title="Detect live GPS"
              >
                <Navigation size={11} className={isLocating ? "animate-spin text-amber-500" : userCoords.isRealGPS ? "text-amber-600 fill-amber-500" : "text-stone-400"} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons & User Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Safety Standards Button */}
          <button
            onClick={() => setShowGuidelinesModal(true)}
            className="w-8 h-8 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-800 text-stone-800 flex items-center justify-center transition-all shadow-[1.5px_1.5px_0px_#1c1917] flex-shrink-0 cursor-pointer"
            title="Community Safety Standards"
          >
            <ShieldCheck size={16} className="text-stone-800 stroke-[2.5]" />
          </button>

          {/* Post a Plan Button (Mockup 3D button) */}
          <button
            onClick={() => requireVerification(() => setShowCreateModal(true), 'create_plan')}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-stone-900 px-3 py-1.5 rounded-2xl text-xs font-black border-2 border-stone-800 shadow-[2px_2px_0px_#1c1917] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all flex-shrink-0 cursor-pointer"
          >
            <Plus size={14} className="stroke-[3] text-stone-900" />
            <span>Post Plan</span>
          </button>

          {/* User Profile Avatar */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full border-2 border-stone-800 overflow-hidden shadow-xs cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all flex-shrink-0"
            title="View Profile & Verifications"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </header>
  );
};

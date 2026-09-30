import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ShieldCheck, Plus, Sparkles, ChevronDown, UserCheck } from 'lucide-react';

export const Navbar = () => {
  const {
    selectedCity,
    setSelectedCity,
    currentUser,
    setActiveTab,
    setShowCreateModal,
    setShowGuidelinesModal
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand & City Selector */}
        <div className="flex items-center gap-2 min-w-0">
          <div 
            onClick={() => setActiveTab('explore')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 flex items-center justify-center text-espresso font-extrabold shadow-sm cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
          >
            <span className="text-base sm:text-lg">⚡</span>
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('explore')}>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-espresso truncate">SquadIn</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[8.5px] uppercase tracking-wider hidden sm:inline">
                India
              </span>
            </div>
            
            {/* City Switcher */}
            <div className="flex items-center gap-0.5 text-stone-500 text-[11px] font-medium cursor-pointer">
              <MapPin size={11} className="text-amber-600 flex-shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-stone-700 font-bold focus:outline-none cursor-pointer text-[11px] max-w-[110px] sm:max-w-none truncate"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi-NCR">Delhi-NCR</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Safety Standards Button */}
          <button
            onClick={() => setShowGuidelinesModal(true)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center transition-all flex-shrink-0"
            title="Community Safety Standards"
          >
            <ShieldCheck size={15} className="text-amber-700" />
          </button>

          {/* Post a Plan Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 bg-espresso hover:bg-stone-800 text-cream px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex-shrink-0"
          >
            <Plus size={13} className="text-amber-400" />
            <span className="inline sm:hidden">Plan</span>
            <span className="hidden sm:inline">Post Plan</span>
          </button>

          {/* User Profile Avatar */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-300 overflow-hidden shadow-xs cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all flex-shrink-0"
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

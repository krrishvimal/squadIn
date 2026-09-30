import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ShieldCheck, Plus, Sparkles, ChevronDown, UserCheck } from 'lucide-react';

export const Navbar = () => {
  const {
    selectedCity,
    setSelectedCity,
    currentUser,
    allUsers,
    setActiveTab,
    setShowCreateModal
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/80 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Brand & City Selector */}
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => setActiveTab('explore')}
            className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-espresso font-extrabold shadow-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('explore')}>
              <span className="font-extrabold text-base tracking-tight text-espresso">SquadIn</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[9px] uppercase tracking-wider">
                India
              </span>
            </div>
            {/* City Switcher */}
            <div className="flex items-center gap-1 text-stone-500 text-xs font-medium cursor-pointer">
              <MapPin size={11} className="text-amber-600" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-stone-700 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="Bengaluru">Bengaluru (Koramangala/HSR)</option>
                <option value="Mumbai">Mumbai (Bandra/Andheri)</option>
                <option value="Delhi-NCR">Delhi-NCR (Cyber City)</option>
                <option value="Pune">Pune (Koregaon Park)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Post a Plan Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-espresso text-cream px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-stone-800 active:scale-95 transition-all"
          >
            <Plus size={14} className="text-amber-400" />
            <span>Post Plan</span>
          </button>

          {/* User Profile Avatar */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full border border-stone-300 overflow-hidden shadow-xs cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
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

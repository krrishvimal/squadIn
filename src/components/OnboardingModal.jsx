import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { INDIAN_CITIES } from '../venueData';
import { X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';


export const OnboardingModal = ({ isOpen, onClose, reason }) => {
  const { currentUser, updateCurrentUserProfile, selectedCity, setSelectedCity, onboardingReason } = useApp();
  const activeReason = reason || onboardingReason || 'general';

  const [name, setName] = useState(currentUser?.name && currentUser?.name !== 'Verified Member' ? currentUser.name : '');
  const [city, setCity] = useState(selectedCity || 'Pune');

  // Sync city when user's location is detected
  useEffect(() => {
    if (selectedCity) {
      setCity(selectedCity);
    }
  }, [selectedCity]);

  // Lock background body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getHeaderSubtitle = () => {
    if (activeReason === 'create_plan') return 'Set up your identity to post a meetup';
    if (activeReason === 'join_plan') return 'Complete your profile to join this crew';
    return 'Complete your profile to continue';
  };
  
  const getSubmitText = () => {
    if (activeReason === 'create_plan') return 'Continue to Post →';
    if (activeReason === 'join_plan') return 'Continue to Join →';
    return 'Start Exploring →';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateCurrentUserProfile({
      ...(currentUser || {}),
      name: name.trim(),
      city: city,
      idVerified: false,
      phoneVerified: false
    });
    
    setSelectedCity(city);
    localStorage.setItem('squadin_onboarded', 'true');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  const handleSkip = () => {
    if (name.trim()) {
      // User entered a name but skipped — save their name and mark as onboarded
      updateCurrentUserProfile({
        ...(currentUser || {}),
        name: name.trim()
      });
      localStorage.setItem('squadin_onboarded', 'true');
    }
    // If no name entered, just close — modal will reappear on next high-intent action
    // via requireVerification gate, but won't auto-show on page load again
    localStorage.setItem('squadin_skip_initial', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 w-screen h-[100dvh] overflow-hidden animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden border border-stone-100 relative bg-[#FDFBF7] text-stone-900 animate-slide-up sm:animate-fade-in pb-2 sm:pb-0">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-3 mb-1 sm:hidden flex-shrink-0" />

        {/* Top-Right Cross 'X' Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-600 flex items-center justify-center transition-colors z-20"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-6 pt-7 pb-3 text-center relative">
          {/* Cute Doodle Logo Badge */}
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 text-stone-900 font-extrabold text-3xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-300/40 border-2 border-amber-200">
            ✨
          </div>
          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
            Welcome to SquadIn
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Find Your Weekend Crew
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-bold mt-1">
            Real plans. Real people. Real fun ☀️
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-stone-700 mb-1.5 uppercase tracking-wide">
              What should we call you?
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-lg">👋</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or nickname"
                className="w-full p-3.5 pl-11 bg-white border-2 border-stone-200/90 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-bold text-sm shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-stone-700 mb-1.5 uppercase tracking-wide">
              Your City
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-lg">📍</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3.5 pl-11 bg-white border-2 border-stone-200/90 rounded-2xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-bold text-sm appearance-none cursor-pointer shadow-xs"
              >
                {INDIAN_CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-center pt-1">
             <p className="text-[11px] text-stone-400 font-bold">
               📱 Add phone number later for +50% trust boost
             </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-md border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <span>{getSubmitText()}</span>
            </button>
          </div>
          
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors font-bold underline underline-offset-4 cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

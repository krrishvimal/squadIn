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
      updateCurrentUserProfile({
        ...(currentUser || {}),
        name: name.trim()
      });
    }
    localStorage.setItem('squadin_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 w-screen h-[100dvh] overflow-hidden animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden border border-stone-700 relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-stone-100 animate-slide-up sm:animate-fade-in pb-2 sm:pb-0">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-600 rounded-full mx-auto mt-3 mb-1 sm:hidden flex-shrink-0" />

        {/* Top-Right Cross 'X' Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-800/50 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors z-20"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-900 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            ⚡
          </div>
          <h2 className="text-xl font-extrabold text-white mb-1">
            Join SquadIn
          </h2>
          <p className="text-sm text-stone-400 font-medium">
            {getHeaderSubtitle()}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase mb-1.5 tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should people call you?"
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800/50 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase mb-1.5 tracking-wider">
              Your City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800/50 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium appearance-none cursor-pointer"
            >
              {INDIAN_CITIES.map(c => (
                <option key={c.name} value={c.name} className="bg-stone-800">{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="text-center pt-2">
             <p className="text-[11px] text-stone-500 font-medium">
               📱 Add phone number later for +50% trust boost
             </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              <span>{getSubmitText()}</span>
            </button>
          </div>
          
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-stone-500 hover:text-stone-300 transition-colors underline decoration-stone-600 underline-offset-4"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

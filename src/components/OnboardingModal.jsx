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
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-900 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            ✨
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 mb-1">
            Find Your Weekend Crew
          </h2>
          <p className="text-sm text-stone-500 font-medium">
            Real plans. Real people. Real fun.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-lg">👋</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should people call you?"
                className="w-full p-3 pl-10 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">
              Your City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium appearance-none cursor-pointer shadow-sm"
            >
              {INDIAN_CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="text-center pt-2">
             <p className="text-xs text-stone-400 font-medium">
               📱 Add phone number later for +50% trust boost
             </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-base rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>{getSubmitText()}</span>
            </button>
          </div>
          
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-4"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

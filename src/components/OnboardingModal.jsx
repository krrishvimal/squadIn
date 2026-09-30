import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ShieldCheck, User, Briefcase, MapPin, Smartphone, ArrowRight, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { initiateLinkedInLogin } from '../lib/linkedinAuth';

const POPULAR_INTERESTS = [
  '☕ Specialty Coffee', '🏸 Badminton', '🎭 Standup Comedy',
  '🏃 Running 5K', '🏺 Pottery & Art', '🥾 Weekend Treks',
  '🍕 Food Walks', '💻 Tech & Startups', '🎬 Indie Cinema'
];

export const OnboardingModal = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile, selectedCity, setSelectedCity } = useApp();

  const [step, setStep] = useState(1); // 1: Profile Info, 2: Phone OTP, 3: Success
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState(currentUser?.age || '');
  const [city, setCity] = useState(selectedCity || 'Bengaluru');
  const [role, setRole] = useState(currentUser?.role || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [selectedInterests, setSelectedInterests] = useState(currentUser?.interests?.length > 0 ? currentUser.interests : ['☕ Specialty Coffee']);

  // Phone OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('789123');

  if (!isOpen) return null;

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    setStep(2);
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
  };

  const handleVerifyAndFinish = () => {
    const updatedProfile = {
      name: name.trim(),
      age: parseInt(age, 10) || 25,
      city: city,
      role: role.trim() || 'Creative Professional',
      company: company.trim() || 'Verified Member',
      bio: bio.trim() || 'Excited to meet new people and explore weekend activities!',
      interests: selectedInterests,
      phoneVerified: true,
      phoneNumber: `+91 ${phone}`,
      idVerified: true
    };

    updateCurrentUserProfile(updatedProfile);
    setSelectedCity(city);
    localStorage.setItem('squadin_onboarded', 'true');
    setStep(3);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleQuickSkip = () => {
    const updatedProfile = {
      name: name.trim() || 'Verified Member',
      age: parseInt(age, 10) || 25,
      city: city,
      role: role.trim() || 'Member',
      company: company.trim() || 'SquadIn',
      bio: bio.trim() || 'Looking forward to weekend hangouts!',
      interests: selectedInterests,
      phoneVerified: true,
      idVerified: true
    };

    updateCurrentUserProfile(updatedProfile);
    setSelectedCity(city);
    localStorage.setItem('squadin_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 relative">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden" />

        {/* Top-Right Cross 'X' Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors z-20 shadow-xs"
          title="Close"
        >
          <X size={17} />
        </button>

        {/* Header */}
        <div className="px-6 pt-4 pb-3 border-b border-stone-100 bg-white sticky top-0 z-10 text-center">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-espresso font-extrabold text-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            ⚡
          </div>
          <h2 className="text-lg font-extrabold text-espresso">
            {step === 1 ? 'Create Your SquadIn ID' : step === 2 ? 'Verify Your Identity' : 'Welcome to SquadIn!'}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {step === 1 ? 'Join verified, small-group weekend hangouts across India' : 'Real-world trust starts with verified members'}
          </p>
        </div>

        {/* STEP 1: Profile Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="overflow-y-auto p-5 space-y-4 bg-white">
            
            {/* Name & Age */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Mehra"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:outline-none focus:border-amber-500 text-center"
                />
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Your Primary City *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Bengaluru">Bengaluru (Koramangala, Indiranagar, HSR)</option>
                <option value="Mumbai">Mumbai (Bandra, BKC, Andheri)</option>
                <option value="Delhi-NCR">Delhi-NCR (Cyber City, Hauz Khas, Noida)</option>
                <option value="Pune">Pune (Koregaon Park, Baner, Viman Nagar)</option>
              </select>
            </div>

            {/* Profession & Workplace */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer / Architect"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Swiggy, CRED, Freelance"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Short Weekend Bio
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Coffee nerd, badminton amateur, looking for weekend crews."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-normal text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Interests Pills */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                Select Your Weekend Passions:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_INTERESTS.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                      selectedInterests.includes(tag)
                        ? 'bg-amber-500 border-amber-600 text-espresso shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-espresso hover:bg-stone-800 text-cream font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <span>Continue to Verification</span>
                <ArrowRight size={14} className="text-amber-400" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Phone / LinkedIn Verification */}
        {step === 2 && (
          <div className="overflow-y-auto p-5 space-y-4">
            
            {/* Phone Verification Box */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Smartphone size={15} className="text-amber-600" />
                <span>1. Mobile Number Verification (+91)</span>
              </div>

              {!otpSent ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-600 flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength="10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-espresso font-extrabold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Send SMS OTP Code
                  </button>
                </div>
              ) : (
                <div className="space-y-2 animate-fade-in">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                    Test OTP code sent to <strong>+91 {phone}</strong>: <span className="font-extrabold tracking-widest text-amber-950">{generatedOtp}</span>
                  </div>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full text-center tracking-widest text-sm p-2.5 rounded-xl border border-stone-300 font-extrabold focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleVerifyAndFinish}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Verify & Create SquadIn ID</span>
                  </button>
                </div>
              )}
            </div>

            {/* LinkedIn Connect Option */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 text-center space-y-2">
              <div className="text-xs font-bold text-blue-950 flex items-center justify-center gap-1.5">
                <span className="font-extrabold text-[#0A66C2]">in</span>
                <span>Fast Track: Connect with LinkedIn</span>
              </div>
              <p className="text-[11px] text-blue-900/80 font-normal">
                Instantly import your verified professional badge for higher trust with hosts.
              </p>
              <button
                onClick={() => {
                  initiateLinkedInLogin();
                }}
                className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Sign In with LinkedIn
              </button>
            </div>

            {/* Quick Skip for testing */}
            <div className="text-center pt-1">
              <button
                onClick={handleQuickSkip}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 underline"
              >
                Skip verification for now & explore ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete */}
        {step === 3 && (
          <div className="p-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-lg font-extrabold text-espresso">SquadIn ID Created!</h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              Your verified profile is live in <strong>{city}</strong>. You're ready to host plans and join weekend crews!
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

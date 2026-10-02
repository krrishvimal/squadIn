import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerificationModal } from './VerificationModal';
import { OnboardingModal } from './OnboardingModal';
import { ShieldCheck, Briefcase, Star, Award, CheckCircle2, UserCheck, ShieldAlert, Heart, Smartphone, ExternalLink, Mail, Edit3, Camera } from 'lucide-react';

export const ProfileView = () => {
  const { currentUser, setShowGuidelinesModal, isUserVerified, setShowOnboardingModal, setOnboardingReason } = useApp();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [verifyTab, setVerifyTab] = useState('phone');

  const openVerification = (tab = 'phone') => {
    setVerifyTab(tab);
    setShowVerifyModal(true);
  };

  const handleStartVerification = () => {
    setOnboardingReason('profile');
    setShowOnboardingModal(true);
  };

  const trustScore = (currentUser.phoneVerified ? 50 : 0) + 
                     (currentUser.idVerified ? 30 : 0) + 
                     (currentUser.linkedin_verified ? 20 : 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900">Your Weekend Starts Here ☀️</h2>
          <p className="text-xs text-stone-500 font-medium">Your verified identity & community reputation</p>
        </div>
        <button
          onClick={() => isUserVerified ? setShowEditProfileModal(true) : handleStartVerification()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
        >
          <Edit3 size={13} />
          <span>{isUserVerified ? 'Edit ID' : 'Setup ID'}</span>
        </button>
      </div>

      {/* Guest Mode Notice */}
      {!isUserVerified && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border border-amber-300/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
              <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px]">Guest Mode</span>
              <span>Complete Verification</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
              Add your name & mobile number to join meetup crews and host plans.
            </p>
          </div>
          <button
            onClick={handleStartVerification}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-espresso text-xs font-extrabold rounded-xl transition-all shadow-xs flex-shrink-0"
          >
            Verify in 30s
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-200"
              />
              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full ring-2 ring-white">
                <ShieldCheck size={14} />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-espresso">{currentUser.name || 'New Member'}</h3>
                {currentUser.age ? <span className="text-xs font-bold text-stone-400">({currentUser.age})</span> : null}
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {currentUser.role ? `${currentUser.role} at ` : 'Tap Edit ID to setup profile'}
                {currentUser.company ? <strong className="text-stone-800">{currentUser.company}</strong> : null}
              </p>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-extrabold flex items-center gap-1">
                  <ShieldCheck size={11} className="text-blue-600" />
                  <span>ID & Phone Verified</span>
                </span>
                {currentUser.linkedin_verified && (
                  <span className="px-2 py-0.5 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2] text-[10px] font-extrabold flex items-center gap-1">
                    <span>in</span>
                    <span>LinkedIn Connected</span>
                  </span>
                )}
                {currentUser.workEmailVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <Briefcase size={11} className="text-emerald-600" />
                    <span>Work Verified (@{currentUser.company?.toLowerCase() || 'swiggy'}.com)</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
          <p className="text-xs text-stone-700 leading-relaxed italic">
            "{currentUser.bio}"
          </p>
        </div>

        {/* Interests */}
        <div>
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
            Passions & Weekend Vibes
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {currentUser.interests?.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* VERIFICATION & CREDENTIALS ACTION HUB */}
      <div className="bg-white rounded-3xl border border-stone-100 p-5 space-y-4 shadow-card">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-extrabold text-stone-900">🛡️ Trust Score</span>
            <span className="text-sm font-extrabold text-amber-600">{trustScore}%</span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${trustScore === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
              style={{ width: `${trustScore}%` }}
            />
          </div>
          {trustScore < 100 && (
            <p className="text-[10px] text-stone-500 mt-1">Complete verifications below to boost your trust score</p>
          )}
          {trustScore === 100 && (
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold">✨ Fully Trusted Member — Maximum visibility on Radar</p>
          )}
        </div>

        <div className="space-y-2">
          {/* Phone OTP */}
          <div className={`p-3 rounded-xl border ${currentUser.phoneVerified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-stone-700 bg-stone-800/50'} transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentUser.phoneVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Phone OTP</p>
                  <p className="text-[10px] text-stone-500">10-Digit Mobile SMS</p>
                </div>
              </div>
              <div className="text-right">
                {currentUser.phoneVerified ? (
                  <span className="text-xs font-bold text-emerald-400">✅ Verified</span>
                ) : (
                  <button onClick={() => openVerification('phone')} className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all">
                    +50% Trust
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Selfie */}
          <div className={`p-3 rounded-xl border ${currentUser.idVerified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-stone-700 bg-stone-800/50'} transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentUser.idVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Camera size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Live Selfie</p>
                  <p className="text-[10px] text-stone-500">Front-camera Verification</p>
                </div>
              </div>
              <div className="text-right">
                {currentUser.idVerified ? (
                  <span className="text-xs font-bold text-emerald-400">✅ Verified</span>
                ) : (
                  <button onClick={() => openVerification('selfie')} className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all">
                    +30% Trust
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* LinkedIn */}
          <div className={`p-3 rounded-xl border ${currentUser.linkedin_verified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-stone-700 bg-stone-800/50'} transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentUser.linkedin_verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <ExternalLink size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">LinkedIn</p>
                  <p className="text-[10px] text-stone-500">Professional Identity</p>
                </div>
              </div>
              <div className="text-right">
                {currentUser.linkedin_verified ? (
                  <span className="text-xs font-bold text-emerald-400">✅ Verified</span>
                ) : (
                  <button onClick={() => openVerification('linkedin')} className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all">
                    +20% Trust
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KARMA & RELIABILITY SCORE */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl border border-amber-200 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="text-amber-600" size={20} />
            <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
              Community Reliability (Karma)
            </h4>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-espresso font-extrabold text-xs shadow-sm flex items-center gap-1">
            <Star size={12} className="fill-espresso text-espresso" />
            <span>{currentUser.karmaScore} / 5.0</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1">
          <div className="bg-white/90 p-2.5 rounded-2xl border border-amber-100 shadow-xs">
            <div className="text-base font-extrabold text-espresso">{currentUser.meetupsAttended}</div>
            <div className="text-[10px] font-bold text-stone-500">Meetups Attended</div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-2xl border border-amber-100 shadow-xs">
            <div className="text-base font-extrabold text-emerald-600">100%</div>
            <div className="text-[10px] font-bold text-stone-500">Show-Up & Zero Flake</div>
          </div>
        </div>

        <p className="text-[10px] text-amber-900/80 text-center font-medium">
          🛡️ High Karma score unlocks priority seating and verified host status.
        </p>
      </div>

      {/* Safety Pledge */}
      <div 
        onClick={() => setShowGuidelinesModal(true)}
        className="p-4 bg-stone-100/80 hover:bg-stone-200/60 rounded-2xl text-center space-y-1 border border-stone-200 cursor-pointer transition-all active:scale-[0.99]"
      >
        <div className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5">
          <Heart size={13} className="text-rose-500 fill-rose-500" />
          <span>SquadIn Community Trust & Safety Standards</span>
        </div>
        <p className="text-[11px] text-stone-600 leading-normal max-w-sm mx-auto">
          Public venues only · Platonic real-world connection · Zero tolerance for harassment, ghosting, or fake profiles.
        </p>
        <span className="text-[10px] font-bold text-amber-800 underline inline-block pt-0.5">
          Read Full Safety Guidelines & Terms ➔
        </span>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerifyModal}
        initialTab={verifyTab}
        onClose={() => setShowVerifyModal(false)}
      />

      {/* Edit Profile ID Modal */}
      <OnboardingModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
    </div>
  );
};

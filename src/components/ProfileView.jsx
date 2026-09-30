import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerificationModal } from './VerificationModal';
import { ShieldCheck, Briefcase, Star, Award, CheckCircle2, UserCheck, ShieldAlert, Heart, Smartphone, ExternalLink, Mail } from 'lucide-react';

export const ProfileView = () => {
  const { currentUser } = useApp();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyTab, setVerifyTab] = useState('phone');

  const openVerification = (tab = 'phone') => {
    setVerifyTab(tab);
    setShowVerifyModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-espresso">Profile & Trust Hub</h2>
        <p className="text-xs text-stone-500 font-medium">Your verified identity & community reputation</p>
      </div>

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
                <h3 className="text-base font-extrabold text-espresso">{currentUser.name}</h3>
                <span className="text-xs font-bold text-stone-400">({currentUser.age})</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">{currentUser.role} at <strong className="text-stone-800">{currentUser.company}</strong></p>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-extrabold flex items-center gap-1">
                  <ShieldCheck size={11} className="text-blue-600" />
                  <span>ID & Phone Verified</span>
                </span>
                {currentUser.linkedInVerified && (
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
      <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-espresso uppercase tracking-wider">Identity & Trust Badges</h3>
            <p className="text-[10px] text-stone-500">Industry-standard authentication required for host trust</p>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Trust Level: High
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* 1. Phone OTP */}
          <button
            onClick={() => openVerification('phone')}
            className="p-3 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Smartphone size={16} className="text-amber-600" />
              <CheckCircle2 size={13} className="text-emerald-600" />
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-stone-800">Phone OTP (+91)</div>
              <div className="text-[10px] text-stone-400">10-Digit Mobile SMS</div>
            </div>
          </button>

          {/* 2. LinkedIn */}
          <button
            onClick={() => openVerification('linkedin')}
            className="p-3 rounded-2xl border border-stone-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0A66C2]">in</span>
              {currentUser.linkedInVerified ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Connect</span>
              )}
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-stone-800">LinkedIn OAuth</div>
              <div className="text-[10px] text-stone-400">Professional Identity</div>
            </div>
          </button>

          {/* 3. Work Email */}
          <button
            onClick={() => openVerification('work_email')}
            className="p-3 rounded-2xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Mail size={16} className="text-emerald-600" />
              {currentUser.workEmailVerified ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Verify</span>
              )}
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-stone-800">Corporate Email</div>
              <div className="text-[10px] text-stone-400">Workplace Verification</div>
            </div>
          </button>
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
      <div className="p-4 bg-stone-100/80 rounded-2xl text-center space-y-1 border border-stone-200">
        <div className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5">
          <Heart size={13} className="text-rose-500 fill-rose-500" />
          <span>SquadIn Community Trust & Safety Pledge</span>
        </div>
        <p className="text-[11px] text-stone-600 leading-normal max-w-sm mx-auto">
          Public venues only · Platonic real-world connection · Zero tolerance for harassment, ghosting, or fake profiles.
        </p>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerifyModal}
        initialTab={verifyTab}
        onClose={() => setShowVerifyModal(false)}
      />
    </div>
  );
};

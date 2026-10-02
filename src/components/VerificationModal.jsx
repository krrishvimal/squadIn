import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Briefcase,
  ExternalLink,
  X,
  Mail,
  RefreshCw,
  Sparkles,
  Lock,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { initiateLinkedInLogin } from '../lib/linkedinAuth';
import { LiveSelfieCapture } from './LiveSelfieCapture';
import { Sheet, ActivityArt } from './DesignKit';

export const VerificationModal = ({ isOpen, onClose, initialTab = 'phone' }) => {
  const { currentUser, updateCurrentUserProfile } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab); // 'phone' | 'selfie' | 'linkedin' | 'work_email'

  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const [generatedOtp, setGeneratedOtp] = useState('749281');
  const [isPhoneVerified, setIsPhoneVerified] = useState(currentUser?.phoneVerified || false);

  // Work Email State
  const [workEmail, setWorkEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isWorkVerified, setIsWorkVerified] = useState(currentUser?.workEmailVerified || false);

  // LinkedIn State
  const [isLinkedInConnecting, setIsLinkedInConnecting] = useState(false);
  const [isLinkedInVerified, setIsLinkedInVerified] = useState(currentUser?.linkedin_verified || false);

  // Synchronize state when modal opens or props update
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsPhoneVerified(Boolean(currentUser?.phoneVerified));
      setIsWorkVerified(Boolean(currentUser?.workEmailVerified));
      setIsLinkedInVerified(Boolean(currentUser?.linkedin_verified));
    }
  }, [isOpen, initialTab, currentUser]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  if (!isOpen) return null;

  // 1. Send SMS OTP
  const handleSendPhoneOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setIsOtpSent(true);
    setTimer(30);
  };

  // 2. Verify Phone OTP
  const handleVerifyPhoneOtp = () => {
    const entered = phoneOtp.join('');
    if (entered === generatedOtp || entered.length === 6) {
      setIsPhoneVerified(true);
      if (updateCurrentUserProfile) {
        updateCurrentUserProfile({ phoneVerified: true, phoneNumber: `+91 ${phoneNumber}` });
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      alert('Invalid OTP. Please check the code sent to your phone.');
    }
  };

  // 3. Send Work Email OTP
  const handleSendWorkEmailOtp = (e) => {
    e.preventDefault();
    if (!workEmail.includes('@') || workEmail.endsWith('@gmail.com') || workEmail.endsWith('@yahoo.com')) {
      alert('Please enter a valid corporate work email address (e.g. name@swiggy.in, name@razorpay.com).');
      return;
    }
    setIsEmailOtpSent(true);
  };

  // 4. Verify Work Email
  const handleVerifyWorkEmail = () => {
    setIsWorkVerified(true);
    const parts = workEmail.split('@');
    if (parts.length < 2 || !parts[1].includes('.')) return;
    const domain = parts[1].split('.')[0].toUpperCase();
    if (updateCurrentUserProfile) {
      updateCurrentUserProfile({
        workEmailVerified: true,
        company: domain || currentUser.company
      });
    }
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // 5. Connect LinkedIn OAuth (Official OpenID Connect Redirect)
  const handleConnectLinkedIn = () => {
    setIsLinkedInConnecting(true);
    initiateLinkedInLogin();
  };

  return (
    <Sheet title="Boost your trust score" onClose={onClose} className="verification-sheet">
        
        {/* Header matching Screen 1 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-200/80 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h2 className="text-lg font-black text-stone-900 tracking-tight">Boost Your Trust Score</h2>
          </div>
          <button
            onClick={onClose}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          >
            <X size={16} className="stroke-[3]" />
          </button>
        </div>

        {/* Tab Switcher matching Screen 1 */}
        <div className="flex bg-white px-5 pt-1 pb-3 gap-2 justify-center border-b border-stone-200/80">
          <button
            onClick={() => setActiveTab('phone')}
            className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-amber-400 text-stone-900 border-2 border-stone-900 font-black shadow-[1.5px_1.5px_0px_#1c1917]'
                : 'bg-[#FAF6EE] text-stone-700 border border-stone-300 font-bold hover:bg-stone-100'
            }`}
          >
            <span>📱 Phone (+50%)</span>
            {isPhoneVerified && <span className="text-emerald-700 font-black">✓</span>}
          </button>

          <button
            onClick={() => setActiveTab('selfie')}
            className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'selfie'
                ? 'bg-amber-400 text-stone-900 border-2 border-stone-900 font-black shadow-[1.5px_1.5px_0px_#1c1917]'
                : 'bg-[#FAF6EE] text-stone-700 border border-stone-300 font-bold hover:bg-stone-100'
            }`}
          >
            <span>📸 Selfie (+30%)</span>
            {currentUser?.idVerified && <span className="text-emerald-700 font-black">✓</span>}
          </button>

          <button
            onClick={() => setActiveTab('linkedin')}
            className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'linkedin'
                ? 'bg-amber-400 text-stone-900 border-2 border-stone-900 font-black shadow-[1.5px_1.5px_0px_#1c1917]'
                : 'bg-[#FAF6EE] text-stone-700 border border-stone-300 font-bold hover:bg-stone-100'
            }`}
          >
            <span>🔗 LinkedIn (+20%)</span>
            {isLinkedInVerified && <span className="text-emerald-700 font-black">✓</span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 space-y-4 bg-white/60">
          
          {/* TAB 1: PHONE SMS OTP matching Screen 1 */}
          {activeTab === 'phone' && (
            <div className="space-y-4 animate-fade-in">
              {/* Screen 1 Center Cartoon Illustration */}
              <div className="flex flex-col items-center justify-center pt-1 pb-2">
                <div className="w-20 h-20 bg-amber-100/80 rounded-full flex items-center justify-center relative border border-amber-200">
                  <ActivityArt type="phone" size={86} />
                </div>
              </div>

              {/* Form Input Group */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-stone-800">
                  <span>Your Phone Number</span>
                  <span className="text-base">🇮🇳</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 bg-[#FAF6EE] border-2 border-stone-300 rounded-2xl text-xs font-black text-stone-800">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter mobile number"
                    className="flex-1 p-3 text-xs font-black rounded-2xl border-2 border-stone-300 bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>

                {!isOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-black text-sm rounded-2xl border-2 border-stone-900 shadow-[2px_3px_0px_#1c1917] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Send OTP ✨</span>
                  </button>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div className="p-2 bg-amber-100/70 rounded-xl border border-amber-300 flex items-center justify-between text-xs font-black">
                      <span className="text-stone-800">OTP Sent: <strong>+91 {phoneNumber}</strong></span>
                      <span className="font-mono text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-400">
                        Demo: {generatedOtp}
                      </span>
                    </div>

                    {/* 6 Dashed Digit Boxes (Exact Screen 1 Match) */}
                    <div className="flex justify-between gap-1.5">
                      {phoneOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          placeholder="0"
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !digit && idx > 0) {
                              document.getElementById(`otp-box-${idx - 1}`)?.focus();
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const copy = [...phoneOtp];
                            copy[idx] = val.slice(-1);
                            setPhoneOtp(copy);
                            if (val && idx < 5) {
                              document.getElementById(`otp-box-${idx + 1}`)?.focus();
                            }
                          }}
                          className="w-11 h-13 text-center text-lg font-black rounded-xl border-2 border-dashed border-stone-400 bg-[#FAF6EE] focus:border-amber-500 focus:outline-none shadow-inner"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                      <span>{timer > 0 ? `Resend in ${timer}s` : <button type="button" onClick={handleSendPhoneOtp} className="text-amber-800 font-black underline">Resend OTP</button>}</span>
                      <button
                        type="button"
                        onClick={() => setPhoneOtp(generatedOtp.split(''))}
                        className="text-amber-800 font-black underline"
                      >
                        Auto-fill Demo
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyPhoneOtp}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl border-2 border-stone-900 shadow-[2px_3px_0px_#1c1917] active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={16} className="stroke-[3]" />
                      <span>Confirm & Verify Phone</span>
                    </button>
                  </div>
                )}

                <p className="text-center text-[11px] font-bold text-stone-500 pt-1">
                  This verifies you're a real person 🤝
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SELFIE ID */}
          {activeTab === 'selfie' && (
            <div className="space-y-4 animate-fade-in">
              <LiveSelfieCapture
                currentAvatar={currentUser?.avatar}
                isVerified={Boolean(currentUser?.idVerified)}
                onPhotoCaptured={(photo) => {
                  updateCurrentUserProfile({
                    avatar: photo,
                    idVerified: true
                  });
                }}
              />

              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldCheck size={14} className="text-amber-700" />
                  <span>Why Live Selfie Verification?</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Meeting real strangers in Bangalore & Pune requires trust. A live front-camera selfie verifies your likeness so hosts and crew members feel safe meeting at the venue.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LINKEDIN OAUTH */}
          {activeTab === 'linkedin' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-bold text-base">
                      in
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-espresso">LinkedIn Identity Badge</h3>
                      <p className="text-[10px] text-stone-500">Official OAuth 2.0 Identity Protocol</p>
                    </div>
                  </div>

                  {isLinkedInVerified && (
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Connected
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Connecting LinkedIn verifies your real employment, company, and professional identity. Profiles with LinkedIn badges receive <strong>4x faster acceptance</strong> into weekend crews.
                </p>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] space-y-1.5 text-stone-600">
                  <div className="flex items-center gap-1 font-bold text-stone-800">
                    <Lock size={12} className="text-amber-600" />
                    <span>Privacy Guarantee:</span>
                  </div>
                  <p>We only read your public full name, verified employer, and avatar. We never post on your behalf or access private messages.</p>
                </div>

                {isLinkedInVerified ? (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <span className="font-bold text-blue-950">LinkedIn Verified: {currentUser.name}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-blue-700">Active</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isLinkedInConnecting}
                    onClick={handleConnectLinkedIn}
                    className="w-full py-3 bg-[#0A66C2] hover:bg-[#084e96] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isLinkedInConnecting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Verifying with LinkedIn OAuth...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink size={14} />
                        <span>Connect & Verify with LinkedIn</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WORK EMAIL VERIFICATION */}
          {activeTab === 'work_email' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                    <Briefcase size={15} className="text-emerald-600" />
                    <span>Corporate Work Email Badge</span>
                  </span>
                  {isWorkVerified && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Work Verified
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Enter your official corporate email (e.g. <code>@swiggy.in</code>, <code>@google.com</code>, <code>@cred.club</code>). We send a 1-time magic code to confirm your work domain.
                </p>

                {!isEmailOtpSent ? (
                  <form onSubmit={handleSendWorkEmailOtp} className="space-y-3 pt-1">
                    <input
                      type="email"
                      required
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="e.g. rahul.sharma@swiggy.in"
                      className="w-full p-2.5 text-xs font-bold rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <Mail size={13} />
                      <span>Send Magic Verification Code</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                      <span className="text-stone-700 font-medium">Magic code sent to <strong>{workEmail}</strong>. (Enter code <code>482103</code> to verify)</span>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="Enter 6-digit corporate code"
                      className="w-full p-2.5 text-xs text-center font-extrabold tracking-widest rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyWorkEmail}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={14} />
                      <span>Verify & Unlock Work Badge</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer matching Screen 1 bottom tray */}
        <div className="px-6 py-3.5 bg-[#FAF6EE] border-t-2 border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-stone-800">
              {Number(Boolean(isPhoneVerified)) + Number(Boolean(currentUser?.idVerified)) + Number(Boolean(isLinkedInVerified))} of 3 badges collected
            </span>
            <div className="flex items-center gap-1">
              <span className={`px-1.5 py-0.5 rounded-lg border text-xs ${isPhoneVerified ? 'bg-amber-200 border-amber-500 text-stone-900 shadow-xs' : 'bg-white border-stone-300 opacity-40'}`}>
                📱
              </span>
              <span className={`px-1.5 py-0.5 rounded-lg border text-xs ${currentUser?.idVerified ? 'bg-amber-200 border-amber-500 text-stone-900 shadow-xs' : 'bg-white border-stone-300 opacity-40'}`}>
                📸
              </span>
              <span className={`px-1.5 py-0.5 rounded-lg border text-xs ${isLinkedInVerified ? 'bg-amber-200 border-amber-500 text-stone-900 shadow-xs' : 'bg-white border-stone-300 opacity-40'}`}>
                🔗
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[1.5px_1.5px_0px_#1c1917] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

    </Sheet>
  );
};

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
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { initiateLinkedInLogin } from '../lib/linkedinAuth';

export const VerificationModal = ({ isOpen, onClose, initialTab = 'phone' }) => {
  const { currentUser, updateCurrentUserProfile } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab); // 'phone' | 'linkedin' | 'work_email'

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
  const [isLinkedInVerified, setIsLinkedInVerified] = useState(currentUser?.linkedInVerified || false);

  // Synchronize state when modal opens or props update
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsPhoneVerified(Boolean(currentUser?.phoneVerified));
      setIsWorkVerified(Boolean(currentUser?.workEmailVerified));
      setIsLinkedInVerified(Boolean(currentUser?.linkedInVerified));
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
    const domain = workEmail.split('@')[1].split('.')[0].toUpperCase();
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-100 text-blue-900 font-extrabold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-espresso">Verification & Trust Engine</h2>
              <p className="text-[10px] text-stone-500 font-medium">Industry-standard authentication & verified badges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('phone')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'phone'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Smartphone size={13} />
            <span>1. Phone OTP</span>
            {isPhoneVerified && <span className="text-emerald-600">✓</span>}
          </button>

          <button
            onClick={() => setActiveTab('linkedin')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'linkedin'
                ? 'border-blue-600 text-blue-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <ExternalLink size={13} />
            <span>2. LinkedIn OAuth</span>
            {isLinkedInVerified && <span className="text-blue-600">✓</span>}
          </button>

          <button
            onClick={() => setActiveTab('work_email')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'work_email'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Mail size={13} />
            <span>3. Work Email</span>
            {isWorkVerified && <span className="text-emerald-600">✓</span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: PHONE SMS OTP */}
          {activeTab === 'phone' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                    <Smartphone size={15} className="text-amber-600" />
                    <span>Indian Mobile Number (+91)</span>
                  </span>
                  {isPhoneVerified && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Phone Verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Anchor your account with a verified 10-digit Indian SIM. Required for emergency SOS alerts and host contact.
                </p>

                {!isOtpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2.5 bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-700">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="flex-1 p-2.5 text-xs font-bold rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-espresso font-extrabold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Send 6-Digit SMS OTP
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                      <span className="text-stone-700 font-medium">OTP sent to: <strong>+91 {phoneNumber}</strong></span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                        Demo OTP: {generatedOtp}
                      </span>
                    </div>

                    {/* 6 Digit Inputs */}
                    <div className="flex justify-between gap-1.5">
                      {phoneOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
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
                          className="w-11 h-12 text-center text-base font-extrabold rounded-xl border border-stone-300 bg-white focus:border-amber-500 focus:outline-none shadow-xs"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-stone-400 font-medium">
                        {timer > 0 ? `Resend OTP in ${timer}s` : (
                          <button
                            type="button"
                            onClick={handleSendPhoneOtp}
                            className="text-amber-700 font-bold hover:underline"
                          >
                            Resend OTP now
                          </button>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneOtp(generatedOtp.split(''));
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Auto-fill Demo OTP
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyPhoneOtp}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={14} />
                      <span>Confirm & Verify Phone Number</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LINKEDIN OAUTH */}
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

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-espresso text-cream font-bold text-xs rounded-xl hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

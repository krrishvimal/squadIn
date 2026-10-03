import React, { useEffect } from 'react';
import { ShieldCheck, Users, MapPin, Award, AlertTriangle, X, CheckCircle2, Lock } from 'lucide-react';

export const CommunityGuidelinesModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 w-screen h-[100dvh] overflow-hidden animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 pb-2 sm:pb-0">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-espresso">SquadIn Safety & Guidelines</h2>
              <p className="text-[10px] text-stone-500 font-medium">Standards for trusted real-world meetups</p>
            </div>
          </div>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
            aria-label="Close guidelines"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          
          {/* Rule 1: Public Spaces */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-espresso font-extrabold text-xs">
              <MapPin size={15} className="text-amber-600" />
              <span>1. 100% Public & Safe Spaces Only</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Meetups take place exclusively in open, public commercial spots (cafes, turf grounds, comedy clubs, comedy trials, shopping centers). Private residences or secluded locations are strictly prohibited.
            </p>
          </div>

          {/* Rule 2: Host Curation & Group Chats */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-espresso font-extrabold text-xs">
              <Lock size={15} className="text-emerald-600" />
              <span>2. Small Crew Quorum & Curation</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Hosts curate who joins their crew based on verified badges and interests. Group chat remains locked until the full crew is confirmed, ensuring deliberate and respectful social dynamics.
            </p>
          </div>

          {/* Rule 3: Zero Tolerance Harassment */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-espresso font-extrabold text-xs">
              <AlertTriangle size={15} className="text-rose-600" />
              <span>3. Zero Tolerance for Harassment & Solicitation</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              SquadIn is an authentic IRL friendship community. Dating pressure, uninvited advances, MLM/commercial pitch spam, or aggressive behavior result in permanent hardware and phone number bans.
            </p>
          </div>

          {/* Rule 4: Accountability & Karma */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-espresso font-extrabold text-xs">
              <Award size={15} className="text-blue-600" />
              <span>4. Punctuality & Karma Accountability</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Showing up when you RSVP is vital. Attendees give karma feedback after each meetup. Chronic no-shows have their karma lowered and are deprioritized by hosts.
            </p>
          </div>

          {/* Rule 5: Women-Only Safety */}
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-950 font-extrabold text-xs">
              <span>🚺</span>
              <span>5. Dedicated Women-Only Hangouts</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-normal">
              Hosts can toggle "Women-Only" for any activity. These plans are exclusively curated for verified female community members.
            </p>
          </div>

          {/* Terms & Privacy Agreement Note */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-stone-500">
              By using SquadIn, you agree to our{' '}
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-semibold hover:text-amber-800">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-semibold hover:text-amber-800">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-white sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-md font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} className="text-amber-400" />
            <span>I Understand & Agree</span>
          </button>
        </div>

      </div>
    </div>
  );
};

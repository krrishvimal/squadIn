import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, UserX, Flag, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

const REPORT_REASONS = [
  { id: 'fake_profile', label: 'Fake profile or unverified identity' },
  { id: 'harassment', label: 'Harassment or inappropriate behavior' },
  { id: 'no_show', label: 'Repeated no-show at meetups' },
  { id: 'commercial_spam', label: 'Commercial promotion or MLM solicitation' },
  { id: 'safety_concern', label: 'Safety or venue conduct violation' },
  { id: 'other', label: 'Other issue' }
];

export const ReportUserModal = ({ isOpen, onClose, targetUser, planId }) => {
  const { blockUser, reportUser } = useApp();
  const [selectedReason, setSelectedReason] = useState('harassment');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (isOpen && targetUser) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const handleReport = (e) => {
    e.preventDefault();
    if (reportUser) {
      reportUser({
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        planId: planId || null,
        reason: selectedReason,
        details: additionalDetails.trim(),
        timestamp: new Date().toISOString()
      });
    }

    if (isBlocking && blockUser) {
      blockUser(targetUser.id);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 w-screen h-[100dvh] overflow-hidden animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 pb-2 sm:pb-0">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <ShieldAlert size={17} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-espresso">Report & Safety Action</h3>
              <p className="text-[10px] text-stone-500 font-medium">Flag member to community safety team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
            aria-label="Close report dialog"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-base font-extrabold text-espresso">Report Submitted</h4>
            <p className="text-xs text-stone-600">
              Thank you for keeping SquadIn safe. Our safety team reviews all reports within 2 hours. {isBlocking && `User ${targetUser.name} has been blocked.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleReport} className="overflow-y-auto p-5 space-y-4">
            {/* Target Member Profile Pill */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200">
              <img
                src={targetUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={targetUser.name}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div>
                <div className="text-xs font-bold text-stone-900">{targetUser.name}</div>
                <div className="text-[10px] text-stone-500">{targetUser.role || 'Member'} at {targetUser.company || 'SquadIn'}</div>
              </div>
            </div>

            {/* Reasons */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Reason for Reporting:
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map(r => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      selectedReason === r.id
                        ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      id={`report-reason-${r.id}`}
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional context input */}
            <div>
              <label htmlFor="report-details" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Additional Details (Optional):
              </label>
              <textarea
                id="report-details"
                name="reportDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Describe what happened to help us take immediate action..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-rose-500 min-h-[70px]"
              />
            </div>

            {/* Block Option Toggle */}
            <label htmlFor="report-block-user" className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <UserX size={16} className="text-amber-700" />
                <div className="text-xs">
                  <div className="font-bold text-stone-800">Block this user</div>
                  <div className="text-[10px] text-stone-500">They won't see your plans or chat with you</div>
                </div>
              </div>
              <input
                id="report-block-user"
                name="blockUser"
                type="checkbox"
                checked={isBlocking}
                onChange={(e) => setIsBlocking(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
            </label>

            {/* Submit Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Flag size={13} />
                <span>Submit Confidential Report</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

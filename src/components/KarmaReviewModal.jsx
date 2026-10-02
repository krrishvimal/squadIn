import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, CheckCircle2, Award, Heart, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export const KarmaReviewModal = () => {
  const {
    showKarmaModal,
    setShowKarmaModal,
    karmaReviewPlan,
    getUserById,
    currentUser,
    submitKarmaReview
  } = useApp();

  const [ratings, setRatings] = useState({});

  if (!showKarmaModal || !karmaReviewPlan) return null;

  const otherMembers = karmaReviewPlan.acceptedMembers
    .filter(id => id !== currentUser.id)
    .map(id => getUserById(id));

  const handleToggleRating = (userId) => {
    setRatings(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSubmit = () => {
    submitKarmaReview(karmaReviewPlan.id, ratings);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-espresso">Post-Meetup Vibe Check</h3>
              <p className="text-[10px] text-stone-500">{karmaReviewPlan.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowKarmaModal(false)}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Did your crew show up on time and maintain a friendly, respectful vibe? Give them a Karma vouch!
        </p>

        {/* Member Rating Checklist */}
        <div className="space-y-2">
          {otherMembers.length === 0 ? (
            <div className="p-4 bg-stone-50 rounded-2xl text-center text-xs text-stone-500 font-medium border border-stone-200">
              No other attendees were confirmed in this crew yet.
            </div>
          ) : (
            otherMembers.map(member => {
              const isVouched = ratings[member.id] !== false; // default true
              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleRating(member.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isVouched
                      ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                      : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={member.avatar} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{member.name}</div>
                      <div className="text-[10px] text-stone-500">{member.company} · ⭐ {member.karmaScore}</div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                    isVouched ? 'bg-amber-500 text-espresso' : 'bg-stone-200 text-stone-600'
                  }`}>
                    <ThumbsUp size={12} />
                    <span>{isVouched ? 'Great Vibe ⭐' : 'Unvouched'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-md font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 size={15} className="text-amber-400" />
          <span>{otherMembers.length === 0 ? 'Mark Meetup Completed' : 'Confirm & Boost Crew Karma'}</span>
        </button>

      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, ShieldCheck, Briefcase, Star, Users, Lock, MessageSquare, CheckCircle2, Navigation } from 'lucide-react';

export const PlanCard = ({ plan }) => {
  const {
    getUserById,
    getPlanDistance,
    currentUser,
    setSelectedPlanForDetail,
    setActiveChatPlanId,
    setActiveTab
  } = useApp();

  const normId = (id) => (id !== null && id !== undefined) ? String(id).trim().toLowerCase() : '';
  const host = getUserById(plan.hostId);
  const isHost = normId(plan.hostId) === normId(currentUser?.id);
  const isMember = plan.acceptedMembers?.some(mId => normId(mId) === normId(currentUser?.id));
  const isPending = plan.pendingRequests?.some(r => normId(r.userId) === normId(currentUser?.id));
  const isUnlocked = plan.status === 'LOCKED_CHAT_ACTIVE';
  const spotsLeft = Math.max(0, plan.targetCapacity - (plan.acceptedMembers?.length || 0));
  const distanceStr = getPlanDistance(plan);

  const handleCardClick = () => {
    setSelectedPlanForDetail(plan);
  };

  const handleChatClick = (e) => {
    e.stopPropagation();
    setActiveChatPlanId(plan.id);
    setActiveTab('chats');
  };

  const getCategoryCardStyle = (cat) => {
    const map = {
      'Cafe & Dinner': { bg: 'bg-[#EDE9FE]', leftBg: 'bg-[#DDD6FE]/80', border: 'border-[#C4B5FD]', text: 'text-[#5B21B6]', tag: 'bg-[#DDD6FE] text-[#5B21B6]', bar: 'bg-[#8B5CF6]', emoji: '☕', short: 'Cafe' },
      'cafe': { bg: 'bg-[#EDE9FE]', leftBg: 'bg-[#DDD6FE]/80', border: 'border-[#C4B5FD]', text: 'text-[#5B21B6]', tag: 'bg-[#DDD6FE] text-[#5B21B6]', bar: 'bg-[#8B5CF6]', emoji: '☕', short: 'Cafe' },
      'Sports & Run': { bg: 'bg-[#D1FAE5]', leftBg: 'bg-[#A7F3D0]/80', border: 'border-[#6EE7B7]', text: 'text-[#065F46]', tag: 'bg-[#A7F3D0] text-[#065F46]', bar: 'bg-[#10B981]', emoji: '⚽', short: 'Sports' },
      'sports': { bg: 'bg-[#D1FAE5]', leftBg: 'bg-[#A7F3D0]/80', border: 'border-[#6EE7B7]', text: 'text-[#065F46]', tag: 'bg-[#A7F3D0] text-[#065F46]', bar: 'bg-[#10B981]', emoji: '⚽', short: 'Sports' },
      'Concerts & Gigs': { bg: 'bg-[#FFEDD5]', leftBg: 'bg-[#FED7AA]/80', border: 'border-[#FDBA74]', text: 'text-[#9A3412]', tag: 'bg-[#FED7AA] text-[#9A3412]', bar: 'bg-[#F97316]', emoji: '🎸', short: 'Concert' },
      'concert': { bg: 'bg-[#FFEDD5]', leftBg: 'bg-[#FED7AA]/80', border: 'border-[#FDBA74]', text: 'text-[#9A3412]', tag: 'bg-[#FED7AA] text-[#9A3412]', bar: 'bg-[#F97316]', emoji: '🎸', short: 'Concert' },
      'Standup & Comedy': { bg: 'bg-[#FEF9C3]', leftBg: 'bg-[#FDE047]/70', border: 'border-[#FACC15]', text: 'text-[#854D0E]', tag: 'bg-[#FDE047] text-[#854D0E]', bar: 'bg-[#EAB308]', emoji: '😂', short: 'Comedy' },
      'comedy': { bg: 'bg-[#FEF9C3]', leftBg: 'bg-[#FDE047]/70', border: 'border-[#FACC15]', text: 'text-[#854D0E]', tag: 'bg-[#FDE047] text-[#854D0E]', bar: 'bg-[#EAB308]', emoji: '😂', short: 'Comedy' },
      'Workshops': { bg: 'bg-[#FCE7F3]', leftBg: 'bg-[#FBCFE8]/80', border: 'border-[#F472B6]', text: 'text-[#9D174D]', tag: 'bg-[#FBCFE8] text-[#9D174D]', bar: 'bg-[#EC4899]', emoji: '🎨', short: 'Workshop' },
      'arts': { bg: 'bg-[#FCE7F3]', leftBg: 'bg-[#FBCFE8]/80', border: 'border-[#F472B6]', text: 'text-[#9D174D]', tag: 'bg-[#FBCFE8] text-[#9D174D]', bar: 'bg-[#EC4899]', emoji: '🎨', short: 'Workshop' },
      'Treks & Walks': { bg: 'bg-[#ECFCCB]', leftBg: 'bg-[#D9F99D]/80', border: 'border-[#BEF264]', text: 'text-[#3F6212]', tag: 'bg-[#D9F99D] text-[#3F6212]', bar: 'bg-[#84CC16]', emoji: '🥾', short: 'Trek' },
      'hike': { bg: 'bg-[#ECFCCB]', leftBg: 'bg-[#D9F99D]/80', border: 'border-[#BEF264]', text: 'text-[#3F6212]', tag: 'bg-[#D9F99D] text-[#3F6212]', bar: 'bg-[#84CC16]', emoji: '🥾', short: 'Trek' },
      'other': { bg: 'bg-[#FFE4E6]', leftBg: 'bg-[#FECDD3]/80', border: 'border-[#FDA4AF]', text: 'text-[#9F1239]', tag: 'bg-[#FECDD3] text-[#9F1239]', bar: 'bg-[#F43F5E]', emoji: '✨', short: 'Squad' }
    };
    return map[cat] || { bg: 'bg-[#FFFBEB]', leftBg: 'bg-[#FDE68A]/80', border: 'border-[#FCD34D]', text: 'text-[#92400E]', tag: 'bg-[#FDE68A] text-[#92400E]', bar: 'bg-[#F59E0B]', emoji: '✨', short: 'Meetup' };
  };

  const catVal = plan.categoryLabel || plan.category;
  const style = getCategoryCardStyle(catVal);
  const acceptedCount = (plan.acceptedMembers?.length || 0);
  const totalCapacity = plan.targetCapacity || 6;
  const fillPercent = Math.min(100, Math.max(12, (acceptedCount / totalCapacity) * 100));

  return (
    <div
      onClick={handleCardClick}
      className={`${style.bg} border-2 border-stone-800 rounded-3xl shadow-[3px_4px_0px_#1c1917] hover:shadow-[4px_6px_0px_#1c1917] hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden flex flex-row relative group`}
    >
      {/* Left Section: Illustrated Category Badge (Mockup Match) */}
      <div className={`w-22 sm:w-26 ${style.leftBg} border-r-2 border-stone-800 flex flex-col items-center justify-center p-3 flex-shrink-0 text-center relative`}>
        <span className="text-3xl sm:text-4xl filter drop-shadow-sm mb-1">{style.emoji}</span>
        <span className="text-[11px] sm:text-xs font-black text-stone-900 tracking-tight">{style.short}</span>
        
        {/* Ticket notch hole */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#FAF6EE] border-l-2 border-stone-800" />
      </div>

      {/* Right Section: Card Details */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
        
        {/* Tags Row */}
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black border border-stone-800 ${style.tag}`}>
              {catVal}
            </span>
            {plan.womenOnly && (
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-rose-200 border border-stone-800 text-rose-900">
                🚺 Women-Only
              </span>
            )}
            {distanceStr && (
              <span className="text-[9.5px] font-black text-stone-600 ml-auto flex items-center gap-0.5">
                📍 {distanceStr}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight mb-2 truncate group-hover:text-amber-800 transition-colors">
            {plan.title}
          </h3>
        </div>

        {/* Progress Bar & Spots Left (Mockup Match) */}
        <div className="space-y-1 my-1">
          <div className="w-full h-2.5 bg-white/90 rounded-full border border-stone-800 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full ${style.bar} transition-all duration-500`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-black text-stone-700">
            <span className="truncate max-w-[130px]">📅 {plan.dateText}</span>
            <span className="text-stone-900 bg-white/70 px-1.5 py-0.2 rounded-md border border-stone-700">
              {acceptedCount}/{totalCapacity} spots filled
            </span>
          </div>
        </div>

        {/* Bottom Row: Host Avatar + Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800/15">
          {/* Host Info */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full border-2 border-stone-800 overflow-hidden shadow-xs">
                <img src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
              </div>
              {host.idVerified && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border border-stone-800 flex items-center justify-center text-[7.5px] text-white font-black">
                  ✓
                </span>
              )}
            </div>
            <span className="text-xs font-black text-stone-800 truncate max-w-[85px]">
              {host.name.split(' ')[0]}
            </span>
          </div>

          {/* Action Button (Preserving all logic) */}
          <div className="flex-shrink-0">
            {isMember ? (
              <button
                onClick={handleChatClick}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-2 border-stone-800 shadow-[2px_2px_0px_#1c1917] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                  isUnlocked
                    ? 'bg-emerald-400 text-stone-900'
                    : 'bg-emerald-200 text-stone-900'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <MessageSquare size={12} className="stroke-[3]" />
                    <span>Chat</span>
                  </>
                ) : (
                  <>
                    <Lock size={11} className="stroke-[3]" />
                    <span>In Crew</span>
                  </>
                )}
              </button>
            ) : isPending ? (
              <span className="px-2.5 py-1 rounded-xl bg-orange-200 text-stone-900 border-2 border-stone-800 text-[11px] font-black shadow-[1.5px_1.5px_0px_#1c1917]">
                Pending
              </span>
            ) : (
              <button
                onClick={handleCardClick}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 font-black text-xs border-2 border-stone-800 shadow-[2px_2px_0px_#1c1917] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Join Crew</span>
                <span>🎟️</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};


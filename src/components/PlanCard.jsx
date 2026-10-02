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

  const getCategoryEmoji = (cat) => {
    const map = {
      'Cafe & Dinner': '☕', 'Sports': '⚽', 'Concerts & Gigs': '🎵',
      'Standup Comedy': '😂', 'Workshops': '🎨', 'Treks & Adventure': '🏔️', 'Other': '✨',
      'cafe': '☕', 'sports': '⚽', 'concert': '🎵', 'comedy': '😂', 'arts': '🎨', 'hike': '🏔️', 'other': '✨'
    };
    return map[cat] || '✨';
  };

  const getCategoryColor = (cat) => {
    const map = {
      'Cafe & Dinner': 'bg-violet-300', 'Sports': 'bg-emerald-300', 'Concerts & Gigs': 'bg-orange-300',
      'Standup Comedy': 'bg-yellow-300', 'Workshops': 'bg-purple-300', 'Treks & Adventure': 'bg-green-300', 'Other': 'bg-pink-300',
      'cafe': 'bg-violet-300', 'sports': 'bg-emerald-300', 'concert': 'bg-orange-300', 'comedy': 'bg-yellow-300', 'arts': 'bg-purple-300', 'hike': 'bg-green-300', 'other': 'bg-pink-300'
    };
    return map[cat] || 'bg-stone-300';
  };

  const getCategoryPillStyle = (cat) => {
    const map = {
      'Cafe & Dinner': 'bg-violet-50 text-violet-700 border border-violet-200',
      'Sports': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'Concerts & Gigs': 'bg-orange-50 text-orange-700 border border-orange-200',
      'Standup Comedy': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'Workshops': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Treks & Adventure': 'bg-green-50 text-green-700 border border-green-200',
      'Other': 'bg-pink-50 text-pink-700 border border-pink-200',
      'cafe': 'bg-violet-50 text-violet-700 border border-violet-200',
      'sports': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'concert': 'bg-orange-50 text-orange-700 border border-orange-200',
      'comedy': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'arts': 'bg-purple-50 text-purple-700 border border-purple-200',
      'hike': 'bg-green-50 text-green-700 border border-green-200',
      'other': 'bg-pink-50 text-pink-700 border border-pink-200'
    };
    return map[cat] || 'bg-stone-50 text-stone-700 border border-stone-200';
  };

  const catVal = plan.categoryLabel || plan.category;

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#FDFBF7] rounded-2xl border border-stone-100 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group flex flex-col"
    >
      {/* Category color strip at top */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${getCategoryColor(catVal)}`} />

      {/* Card body */}
      <div className="p-4 pt-5">
        {/* Top row: Category emoji + Category pill */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryEmoji(catVal)}</span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getCategoryPillStyle(catVal)}`}>
              {catVal}
            </span>
          </div>
          
          {/* Status Badge */}
          {isUnlocked ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1 animate-pulse">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>Chat Active</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
              <span>{spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left</span>
            </span>
          )}
        </div>
        
        {/* Plan title */}
        <h3 className="text-stone-900 font-extrabold text-base leading-tight mb-2 group-hover:text-amber-700 transition-colors">
          {plan.title}
        </h3>
        
        {/* Date & Location pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1 text-stone-500 text-xs font-medium">
            📅 {plan.dateText}
          </span>
          <span className="inline-flex items-center gap-1 text-stone-500 text-xs font-medium truncate max-w-[200px]">
            📍 {plan.venueName || plan.neighborhood}
          </span>
          {plan.womenOnly && (
            <span className="inline-flex px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold items-center gap-1">
              🚺 Women-Only
            </span>
          )}
        </div>
        
        {/* Host + Crew row */}
        <div className="flex items-center justify-between mb-4">
          {/* Host */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full ring-2 ring-amber-400 overflow-hidden">
                <img src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
              </div>
              {host.idVerified && (
                <ShieldCheck
                  size={12}
                  className="absolute -bottom-0.5 -right-0.5 text-blue-600 bg-white rounded-full fill-blue-50"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-stone-600 text-xs font-medium flex items-center gap-1">
                {host.name}
                {isHost && (
                  <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded">
                    Host
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5">
                <span className="flex items-center text-amber-700 font-bold">
                  <Star size={10} className="fill-amber-400 text-amber-500 mr-0.5" />
                  {host.karmaScore}
                </span>
              </div>
            </div>
          </div>
          
          {/* Crew dot meter */}
          <div className="flex items-center gap-1 bg-stone-50 px-2 py-1.5 rounded-lg border border-stone-100">
            <div className="flex gap-0.5">
              {Array.from({ length: plan.targetCapacity || 6 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${
                  i < (plan.acceptedMembers?.length || 0) 
                    ? isUnlocked ? 'bg-emerald-400' : 'bg-amber-400' 
                    : 'bg-stone-200'
                }`} />
              ))}
            </div>
            <span className="text-stone-500 text-[10px] font-bold ml-1">
              {(plan.acceptedMembers?.length || 0)}/{plan.targetCapacity || 6}
            </span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-stone-100">
          {isMember ? (
            <button
              onClick={handleChatClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isUnlocked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isUnlocked ? (
                <>
                  <MessageSquare size={13} />
                  <span>Open Chat</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>In Crew</span>
                </>
              )}
            </button>
          ) : isPending ? (
            <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold">
              Pending Approval
            </span>
          ) : (
            <button
              onClick={handleCardClick}
              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-900 font-extrabold shadow-md hover:bg-amber-600 text-sm transition-all"
            >
              Join Crew 🎟️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


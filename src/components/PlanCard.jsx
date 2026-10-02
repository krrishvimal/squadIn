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

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-stone-100 p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer relative overflow-hidden group flex flex-col"
    >
      {/* Category Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        plan.category === 'cafe' ? 'bg-violet-300' :
        plan.category === 'sports' ? 'bg-emerald-300' :
        plan.category === 'concert' ? 'bg-orange-300' :
        plan.category === 'comedy' ? 'bg-yellow-300' :
        plan.category === 'arts' ? 'bg-pink-300' :
        plan.category === 'hike' ? 'bg-green-300' :
        'bg-blue-300'
      }`} />

      {/* Category, Distance & Safety Tags */}
      <div className="flex items-center justify-between gap-2 mb-2.5 mt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold flex items-center gap-1">
            {plan.category === 'cafe' && '☕'}
            {plan.category === 'sports' && '🏸'}
            {plan.category === 'concert' && '🎵'}
            {plan.category === 'arts' && '🏺'}
            {plan.category === 'comedy' && '🎭'}
            {plan.category === 'hike' && '🥾'}
            {plan.category === 'other' && '✨'}
            {plan.categoryLabel}
          </span>

          {/* Real-time Distance Badge */}
          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-0.5">
            <Navigation size={10} className="text-amber-600" />
            <span>{distanceStr} away</span>
          </span>

          {plan.womenOnly && (
            <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold flex items-center gap-1">
              <span>🚺</span> Women-Only
            </span>
          )}
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

      {/* Plan Title */}
      <h3 className="font-extrabold text-base text-stone-900 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
        {plan.title}
      </h3>

      {/* Date & Venue */}
      <div className="space-y-1 text-xs text-stone-500 font-medium mb-3.5">
        <div className="flex items-center gap-1.5 font-semibold text-stone-500">
          <Calendar size={13} className="text-amber-600 flex-shrink-0" />
          <span>{plan.dateText}</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500 truncate">
          <MapPin size={13} className="text-stone-400 flex-shrink-0" />
          <span className="truncate">{plan.venueName} · <strong className="text-stone-700">{plan.neighborhood}</strong></span>
        </div>
      </div>

      {/* Spots Progress Bar */}
      <div className="mb-3.5">
        <div className="flex justify-between text-[11px] font-bold mb-1">
          <span className="text-stone-600 flex items-center gap-1">
            <Users size={12} className="text-stone-400" />
            <span>Crew Quorum:</span>
          </span>
          <span className={isUnlocked ? "text-emerald-700 font-extrabold" : "text-amber-700"}>
            {plan.acceptedMembers.length} / {plan.targetCapacity} Filled
          </span>
        </div>
        
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden flex gap-0.5">
          {Array.from({ length: plan.targetCapacity }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-full rounded-full transition-all ${
                idx < plan.acceptedMembers.length
                  ? isUnlocked
                    ? 'bg-emerald-500'
                    : 'bg-amber-400'
                  : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Host Card & Attendee Avatars */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        
        {/* Host info */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={host.avatar}
              alt={host.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-amber-400"
            />
            {host.idVerified && (
              <ShieldCheck
                size={12}
                className="absolute -bottom-0.5 -right-0.5 text-blue-600 bg-white rounded-full fill-blue-50"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-stone-600 leading-none">
                {host.name}
              </span>
              {isHost && (
                <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded">
                  Host
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-0.5">
              <span className="flex items-center text-amber-700 font-bold">
                <Star size={10} className="fill-amber-400 text-amber-500 mr-0.5" />
                {host.karmaScore}
              </span>
              <span>•</span>
              <span className="truncate max-w-[90px]">{host.company}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
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
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-900 shadow-sm hover:bg-amber-600 text-sm font-extrabold transition-all"
          >
            View & Join
          </button>
        )}

      </div>
    </div>
  );
};


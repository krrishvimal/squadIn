import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapLocationViewer } from './MapLocationViewer';
import {
  X,
  Calendar,
  MapPin,
  ShieldCheck,
  Briefcase,
  Star,
  Users,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
  UserPlus,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';

export const PlanDetailModal = () => {
  const {
    plans,
    selectedPlanForDetail,
    setSelectedPlanForDetail,
    getUserById,
    getPlanDistance,
    currentUser,
    requestToJoinPlan,
    acceptJoinRequest,
    rejectJoinRequest,
    hostEarlyUnlockPlan,
    hostUpdateCapacity,
    setActiveChatPlanId,
    setActiveTab,
    requireVerification
  } = useApp();

  const [joinNote, setJoinNote] = useState('');
  const [showOptionalNote, setShowOptionalNote] = useState(false);
  const [joinRequestSent, setJoinRequestSent] = useState(false);

  useEffect(() => {
    if (selectedPlanForDetail) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [selectedPlanForDetail]);

  if (!selectedPlanForDetail) return null;

  const normId = (id) => (id !== null && id !== undefined) ? String(id).trim().toLowerCase() : '';

  // Reactively track the latest plan state from context
  const plan = plans.find(p => normId(p.id) === normId(selectedPlanForDetail.id)) || selectedPlanForDetail;
  const host = getUserById(plan.hostId);
  const isHost = normId(plan.hostId) === normId(currentUser?.id);
  const isMember = plan.acceptedMembers?.some(mId => normId(mId) === normId(currentUser?.id));
  const isPending = plan.pendingRequests?.some(r => normId(r.userId) === normId(currentUser?.id));
  const isUnlocked = plan.status === 'LOCKED_CHAT_ACTIVE';
  const spotsLeft = Math.max(0, plan.targetCapacity - (plan.acceptedMembers?.length || 0));

  const handleClose = () => {
    setSelectedPlanForDetail(null);
  };

  // Removed handleSendRequest as we now use inline handlers for one-tap join and optional note

  const handleOpenChat = () => {
    setActiveChatPlanId(plan.id);
    setSelectedPlanForDetail(null);
    setActiveTab('chats');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 w-screen h-[100dvh] overflow-hidden animate-fade-in">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 pb-2 sm:pb-0">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden flex-shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-[#FDFBF7] sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs">
              {plan.categoryLabel}
            </span>
            {plan.womenOnly && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-xs flex items-center gap-1">
                <span>🚺</span> Women-Only
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 shadow-sm flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors p-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          
          {/* Title & Status */}
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 leading-snug mb-2">
              {plan.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-stone-700 text-xs font-bold flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-600" />
                {plan.dateText}
              </span>
              <span className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-stone-700 text-xs font-bold flex items-center gap-1.5">
                <MapPin size={13} className="text-stone-400" />
                {plan.neighborhood}
              </span>
            </div>
          </div>

          {/* Host Info Card */}
          <div className="bg-white rounded-xl border border-stone-100 p-3 flex items-center gap-3">
            <div className="relative">
              <img
                src={host.avatar}
                alt={host.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
              />
              {host.idVerified && (
                <ShieldCheck
                  size={14}
                  className="absolute -bottom-1 -right-1 text-emerald-600 bg-white rounded-full fill-emerald-50"
                />
              )}
            </div>
            <div>
              <div className="text-stone-800 font-bold text-sm">{host.name}</div>
              <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                <span>Host</span>
                <span>•</span>
                <span className="flex items-center text-amber-600 font-bold">
                  <Star size={11} className="fill-amber-400 mr-1" />
                  {host.karmaScore}
                </span>
                <span>•</span>
                <span>{host.company}</span>
              </div>
            </div>
          </div>

          {/* Quorum / Capacity Progress Banner */}
          <div className={`p-4 rounded-2xl border ${isUnlocked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800">
                <Users size={15} className={isUnlocked ? "text-emerald-600" : "text-amber-600"} />
                <span>Crew Capacity & Status:</span>
              </div>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                isUnlocked ? 'bg-emerald-100 text-emerald-900' : 'text-amber-700 font-bold text-xs'
              }`}>
                {isUnlocked ? 'Filled' : `${spotsLeft} spots left!`}
              </span>
            </div>

            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden flex gap-1 mb-2">
              {Array.from({ length: plan.targetCapacity }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-full rounded-full transition-all ${
                    idx < plan.acceptedMembers.length
                      ? isUnlocked ? 'bg-emerald-500' : 'bg-amber-400'
                      : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-stone-400 font-medium text-center mt-2">
              {isUnlocked
                ? '🎉 Crew is full! Group chat is unlocked and ready for coordination.'
                : `🔒 Chat unlocks automatically once the host accepts ${spotsLeft} more member${spotsLeft === 1 ? '' : 's'}.`}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm">
            <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider mb-2">
              About this plan
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed font-normal">
              {plan.description}
            </p>
          </div>

          {/* Host's Pinned Location Interactive Map Viewer for Attendees */}
          <MapLocationViewer
            lat={plan.venueLat}
            lng={plan.venueLng}
            venueName={plan.venueName}
            neighborhood={plan.neighborhood}
            categoryLabel={plan.categoryLabel}
            categoryIcon={
              plan.category === 'cafe' ? '☕' :
              plan.category === 'sports' ? '🏸' :
              plan.category === 'concert' ? '🎵' :
              plan.category === 'comedy' ? '🎭' :
              plan.category === 'arts' ? '🏺' :
              plan.category === 'hike' ? '🥾' : '✨'
            }
            distanceStr={getPlanDistance(plan)}
          />

          {/* HOST & ATTENDEES LIST */}
          <div className="bg-white p-4 rounded-xl border border-stone-100 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                Confirmed Crew Members ({plan.acceptedMembers.length})
              </h4>
              {isHost && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                  <span className="text-[10px] text-stone-400">Capacity:</span>
                  <button
                    onClick={() => hostUpdateCapacity(plan.id, -1)}
                    disabled={plan.targetCapacity <= plan.acceptedMembers.length}
                    className="w-5 h-5 rounded bg-stone-100 disabled:opacity-30 hover:bg-stone-200 flex items-center justify-center text-xs font-bold"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-xs font-bold">{plan.targetCapacity}</span>
                  <button
                    onClick={() => hostUpdateCapacity(plan.id, 1)}
                    className="w-5 h-5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-bold"
                    title="Add free extra seat (+1)"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {plan.acceptedMembers.map(memberId => {
                const member = getUserById(memberId);
                const isMemberHost = memberId === plan.hostId;
                return (
                  <div key={memberId} className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className={`w-9 h-9 rounded-full object-cover border-2 ${isMemberHost ? 'border-amber-400' : 'border-emerald-400'}`}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-stone-800">{member.name}</span>
                          {(member.phoneVerified || member.idVerified) ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">
                              <ShieldCheck size={10} />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-500 text-[9px] font-bold">
                              New Member
                            </span>
                          )}
                          {isMemberHost && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-extrabold text-[9px] uppercase border border-amber-200">
                              Host
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <span>{member.role} at {member.company}</span>
                          <span>•</span>
                          <span className="flex items-center text-amber-600 font-bold">
                            <Star size={9} className="fill-amber-400 mr-0.5" />
                            {member.karmaScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HOST APPROVAL CONTROL PANEL (Mockup Screen 2: Host Dashboard) */}
          {isHost && (
            <div className="bg-[#FAF6EE] p-5 rounded-3xl border-2 border-stone-800 space-y-3.5 shadow-[2px_3px_0px_#1c1917]">
              <div>
                <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Host Dashboard</span>
                </h3>
                <p className="text-xs font-bold text-stone-500 mt-0.5">{plan.title}</p>
              </div>

              {/* 4/6 Crew Filled Pill with Avatar Stack (Screen 2) */}
              <div className="flex items-center justify-between bg-amber-300/80 border-2 border-stone-800 rounded-full px-4 py-1.5 shadow-[1.5px_1.5px_0px_#1c1917]">
                <span className="text-xs font-black text-stone-900">
                  {plan.acceptedMembers.length}/{plan.targetCapacity} Crew Filled
                </span>
                <div className="flex -space-x-2 overflow-hidden">
                  {plan.acceptedMembers.slice(0, 4).map(mId => {
                    const m = getUserById(mId);
                    return (
                      <img key={mId} src={m.avatar} alt={m.name} className="inline-block w-6 h-6 rounded-full border-2 border-stone-800 object-cover" />
                    );
                  })}
                </div>
              </div>

              {/* Pending Requests Section */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                  <span>📩</span>
                  <span>Pending Requests ({plan.pendingRequests?.length || 0})</span>
                </div>

                {plan.pendingRequests?.length > 0 ? (
                  <div className="space-y-2.5">
                    {plan.pendingRequests.map(req => {
                      const applicant = getUserById(req.userId);
                      const isVerified = Boolean(applicant.phoneVerified || applicant.idVerified);
                      return (
                        <div key={req.userId} className="p-3.5 bg-white rounded-2xl border-2 border-stone-800 shadow-[2px_2px_0px_#1c1917] space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-full border-2 border-stone-800 p-0.5 bg-gradient-to-tr from-amber-400 to-amber-200 flex-shrink-0">
                                <img src={applicant.avatar} className="w-full h-full rounded-full object-cover" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-black text-stone-900">{applicant.name}</span>
                                  {isVerified ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-emerald-100 border border-emerald-400 text-emerald-800 text-[9px] font-black">
                                      ✅ Verified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-stone-100 border border-stone-300 text-stone-600 text-[9px] font-black">
                                      New Member
                                    </span>
                                  )}
                                </div>
                                
                                {/* Trust Meter */}
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-bold text-stone-500">Trust meter</span>
                                  <div className="w-14 h-1.5 bg-stone-100 rounded-full border border-stone-300 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${isVerified ? 80 : 35}%` }} />
                                  </div>
                                  <span className="text-[9px] font-black text-stone-700">{isVerified ? '80%' : '35%'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-stone-700 italic font-medium bg-[#FAF6EE] p-2 rounded-xl border border-stone-200">
                            "{req.message || 'Love cafes! Count me in 🙌'}"
                          </p>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => acceptJoinRequest(plan.id, req.userId)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl border-2 border-stone-900 shadow-[1.5px_2px_0px_#1c1917] active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Accept</span>
                              <span>🎟️</span>
                            </button>
                            <button
                              onClick={() => rejectJoinRequest(plan.id, req.userId)}
                              className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-black text-xs rounded-xl border border-stone-300 active:translate-y-0.5 transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 font-bold bg-white/70 p-3 rounded-xl border border-stone-200">
                    No pending requests yet. As members request to join, approve them here!
                  </p>
                )}
              </div>

              {/* Confirmed Crew Section (Screen 2 Bottom) */}
              <div className="pt-2 border-t border-stone-800/15">
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-900 mb-2.5">
                  <span>✅</span>
                  <span>Confirmed Crew ({plan.acceptedMembers.length})</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {plan.acceptedMembers.map(memberId => {
                    const member = getUserById(memberId);
                    return (
                      <div key={memberId} className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="w-11 h-11 rounded-full border-2 border-stone-800 p-0.5 bg-amber-100 overflow-hidden shadow-xs">
                          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black text-stone-800 truncate max-w-[50px]">
                          {member.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Host Instant Early Unlock Action */}
              {!isUnlocked && plan.acceptedMembers.length >= 2 && (
                <div className="pt-2">
                  <button
                    onClick={() => hostEarlyUnlockPlan(plan.id)}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-black text-xs rounded-2xl border-2 border-stone-800 shadow-[2px_2px_0px_#1c1917] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className="stroke-[3]" />
                    <span>Host: Lock Crew & Unlock Chat Now (Free)</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer / Action CTA (Mockup Screen 3: Celebrations) */}
        <div className="p-4 border-t-2 border-stone-800/10 bg-[#FAF6EE] sticky bottom-0 z-10">
          {isMember ? (
            /* Screen 3 Bottom Half: Celebration Card */
            <div className="bg-emerald-50/90 border-2 border-stone-800 rounded-3xl p-4 text-center space-y-2.5 shadow-[2px_3px_0px_#1c1917] animate-fade-in relative overflow-hidden">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 border-2 border-stone-800 flex items-center justify-center text-2xl shadow-xs">
                🎟️
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 leading-tight">
                  You're In! Welcome to the Crew!
                </h3>
                <p className="text-xs font-bold text-stone-600 mt-0.5">
                  {plan.title} • {plan.dateText}
                </p>
              </div>

              {/* Overlapping Avatar Stack (Screen 3) */}
              <div className="flex justify-center -space-x-2 py-1">
                {plan.acceptedMembers.map(mId => {
                  const m = getUserById(mId);
                  return (
                    <img key={mId} src={m.avatar} alt={m.name} className="inline-block w-8 h-8 rounded-full border-2 border-stone-800 object-cover shadow-xs" />
                  );
                })}
              </div>

              <button
                onClick={handleOpenChat}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl border-2 border-stone-900 shadow-[2px_3px_0px_#1c1917] active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={16} className="stroke-[3]" />
                <span>Open Crew Chat</span>
              </button>
            </div>
          ) : isPending || joinRequestSent ? (
            <div className="flex flex-col gap-2">
              <div className="text-center p-3 bg-emerald-100 border-2 border-stone-800 rounded-2xl text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1c1917]">
                <span>✅ Join Request Sent! Waiting for host to accept.</span>
              </div>
              
              {!showOptionalNote ? (
                <button
                  onClick={() => setShowOptionalNote(true)}
                  className="text-xs text-stone-600 hover:text-stone-900 font-black text-center transition-colors py-1 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <span>💬 Add a note for the host (optional)</span>
                </button>
              ) : (
                <div className="space-y-2 mt-1 animate-fade-in bg-white border-2 border-stone-800 rounded-2xl p-3 shadow-sm">
                  <textarea
                    value={joinNote}
                    onChange={(e) => setJoinNote(e.target.value)}
                    placeholder="Add a quick note for the host (e.g. 'Love cafes! Count me in 🙌')..."
                    className="w-full text-xs font-bold p-3 rounded-xl border-2 border-stone-200 focus:outline-none focus:border-amber-400 bg-stone-50 resize-none h-20"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        requestToJoinPlan(plan.id, joinNote);
                        setShowOptionalNote(false);
                      }}
                      className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-black text-xs rounded-xl border-2 border-stone-800 shadow-[1.5px_2px_0px_#1c1917] transition-all cursor-pointer"
                    >
                      Send Note
                    </button>
                    <button
                      onClick={() => setShowOptionalNote(false)}
                      className="px-4 py-2.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => requireVerification(() => {
                requestToJoinPlan(plan.id, '');
                setJoinRequestSent(true);
              }, 'join_plan')}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-900 rounded-2xl font-black text-sm border-2 border-stone-900 shadow-[2px_3px_0px_#1c1917] active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Request to Join Crew</span>
              <span className="text-xs text-amber-950 font-bold">• Free</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

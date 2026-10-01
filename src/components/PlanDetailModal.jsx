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

  // Reactively track the latest plan state from context
  const plan = plans.find(p => p.id === selectedPlanForDetail.id) || selectedPlanForDetail;
  const host = getUserById(plan.hostId);
  const isHost = plan.hostId === currentUser.id;
  const isMember = plan.acceptedMembers.includes(currentUser.id);
  const isPending = plan.pendingRequests?.some(r => r.userId === currentUser.id);
  const isUnlocked = plan.status === 'LOCKED_CHAT_ACTIVE';
  const spotsLeft = Math.max(0, plan.targetCapacity - plan.acceptedMembers.length);

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 w-screen h-[100dvh] overflow-hidden animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 pb-2 sm:pb-0">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden flex-shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-white sticky top-0 z-10 flex-shrink-0">
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
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          
          {/* Title & Status */}
          <div>
            <h2 className="text-xl font-extrabold text-espresso leading-snug mb-1">
              {plan.title}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
              <span className="text-amber-700">{plan.dateText}</span>
              <span>•</span>
              <span className="text-stone-500">{plan.neighborhood}</span>
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
                isUnlocked ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
              }`}>
                {plan.acceptedMembers.length} / {plan.targetCapacity} Filled
              </span>
            </div>

            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex gap-1 mb-2">
              {Array.from({ length: plan.targetCapacity }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-full rounded-full transition-all ${
                    idx < plan.acceptedMembers.length
                      ? isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                      : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-stone-600 font-medium">
              {isUnlocked
                ? '🎉 Crew is full! Group chat is unlocked and ready for coordination.'
                : `🔒 Chat unlocks automatically once the host accepts ${spotsLeft} more member${spotsLeft === 1 ? '' : 's'}.`}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              Plan Description
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed font-normal">
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
          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
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
                  <div key={memberId} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-stone-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-800">{member.name}</span>
                          {isMemberHost && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[9px] uppercase">
                              Host
                            </span>
                          )}
                          {member.idVerified && (
                            <ShieldCheck size={13} className="text-blue-600 fill-blue-50" />
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

          {/* HOST APPROVAL CONTROL PANEL (If Host has pending requests) */}
          {isHost && (
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  <UserPlus size={15} className="text-amber-700" />
                  <span>Pending Join Requests ({plan.pendingRequests?.length || 0})</span>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold">
                  You have full approval power
                </span>
              </div>

              {plan.pendingRequests?.length > 0 ? (
                <div className="space-y-2">
                  {plan.pendingRequests.map(req => {
                    const applicant = getUserById(req.userId);
                    return (
                      <div key={req.userId} className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img src={applicant.avatar} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                <span>{applicant.name}</span>
                                {applicant.idVerified && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[9px] font-extrabold flex items-center gap-0.5 border border-blue-200">
                                    <ShieldCheck size={10} className="text-blue-600" />
                                    <span>Live Verified</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-500">{applicant.company} · ⭐ {applicant.karmaScore}</div>
                            </div>
                          </div>
                          <div className="text-[10px] text-stone-400 font-medium">{req.requestedAt}</div>
                        </div>

                        <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg mb-2.5">
                          "{req.message}"
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptJoinRequest(plan.id, req.userId)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                            <span>Accept Into Crew</span>
                          </button>
                          <button
                            onClick={() => rejectJoinRequest(plan.id, req.userId)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-800 font-medium">
                  No pending requests. Nearby members will appear here as they apply.
                </p>
              )}

              {/* Host Instant Early Unlock Action */}
              {!isUnlocked && plan.acceptedMembers.length >= 2 && (
                <div className="pt-2 border-t border-amber-200/80">
                  <button
                    onClick={() => hostEarlyUnlockPlan(plan.id)}
                    className="w-full py-2 bg-espresso hover:bg-stone-800 text-cream font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Lock Crew & Unlock Chat Now (Free)</span>
                  </button>
                  <p className="text-[10px] text-center text-stone-500 mt-1">
                    Host perk: Start coordinating immediately with your current {plan.acceptedMembers.length} members.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer / Action CTA */}
        <div className="p-4 border-t border-stone-200 bg-white sticky bottom-0 z-10">
          {isMember ? (
            <button
              onClick={handleOpenChat}
              className={`w-full py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                isUnlocked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                  : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
              }`}
            >
              {isUnlocked ? (
                <>
                  <MessageSquare size={16} />
                  <span>Open Unlocked Group Chat</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>You're in the Crew (Chat Unlocks on Full)</span>
                </>
              )}
            </button>
          ) : isPending || joinRequestSent ? (
            <div className="flex flex-col gap-2">
              <div className="text-center py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <span>✅ Join Request Sent! Waiting for host to accept.</span>
              </div>
              
              {!showOptionalNote ? (
                <button
                  onClick={() => setShowOptionalNote(true)}
                  className="text-[11px] text-stone-500 hover:text-stone-700 font-medium text-center transition-colors py-1 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <span>💬 Add a note for the host (optional)</span>
                </button>
              ) : (
                <div className="space-y-2 mt-1 animate-fade-in">
                  <textarea
                    value={joinNote}
                    onChange={(e) => setJoinNote(e.target.value)}
                    placeholder="Add a quick note for the host (e.g. 'Hey, excited for coffee!')..."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-500 bg-stone-50 resize-none h-16"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        requestToJoinPlan(plan.id, joinNote);
                        setShowOptionalNote(false);
                      }}
                      className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Send Note
                    </button>
                    <button
                      onClick={() => setShowOptionalNote(false)}
                      className="px-4 py-2 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-200"
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
              className="w-full py-3 bg-espresso hover:bg-stone-800 text-cream rounded-2xl font-extrabold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Request to Join Crew</span>
              <span className="text-xs text-amber-400 font-semibold">• Free</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

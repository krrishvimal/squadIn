import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Send,
  Lock,
  Sparkles,
  Users,
  ShieldAlert,
  MapPin,
  Calendar,
  CheckCircle2,
  Share2,
  Star,
  ChevronLeft,
  Info
} from 'lucide-react';

export const ChatView = () => {
  const {
    plans,
    activeChatPlanId,
    setActiveChatPlanId,
    currentUser,
    getUserById,
    sendMessage,
    hostEarlyUnlockPlan,
    triggerEmergencySOS,
    setShowKarmaModal,
    setKarmaReviewPlan
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosContent, setSosContent] = useState('');
  const [copiedSOS, setCopiedSOS] = useState(false);

  const messagesEndRef = useRef(null);

  // Find active plan
  const activePlan = plans.find(p => p.id === activeChatPlanId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePlan?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activePlan) return;
    sendMessage(activePlan.id, inputMessage);
    setInputMessage('');
  };

  const handleTriggerSOS = async () => {
    if (!activePlan) return;
    const text = await triggerEmergencySOS(activePlan);
    setSosContent(text);
    setSosModalOpen(true);
  };

  const handleCopySOS = () => {
    navigator.clipboard.writeText(sosContent);
    setCopiedSOS(true);
    setTimeout(() => setCopiedSOS(false), 2500);
  };

  const handleOpenKarma = () => {
    if (!activePlan) return;
    setKarmaReviewPlan(activePlan);
    setShowKarmaModal(true);
  };

  // If no specific chat selected, show all user's chats list
  if (!activePlan) {
    const userPlans = plans.filter(p => p.acceptedMembers.includes(currentUser.id));
    const activeUnlocked = userPlans.filter(p => p.status === 'LOCKED_CHAT_ACTIVE');
    const waitingLocked = userPlans.filter(p => p.status === 'OPEN');

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-espresso">Group Chats</h2>
          <p className="text-xs text-stone-500 font-medium">Temporary group chats for your weekend plans</p>
        </div>

        {/* Unlocked Active Chats */}
        <div>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Active Group Chats ({activeUnlocked.length})</span>
          </h3>

          {activeUnlocked.length > 0 ? (
            <div className="space-y-2">
              {activeUnlocked.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setActiveChatPlanId(plan.id)}
                  className="bg-white p-3.5 rounded-2xl border border-stone-200 hover:border-amber-500 shadow-sm transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-base flex-shrink-0">
                      💬
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-espresso leading-snug">{plan.title}</h4>
                      <p className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {plan.venueName} · {plan.acceptedMembers.length} Members
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl flex-shrink-0">
                    Chat
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-dashed border-stone-300 text-center">
              <MessageSquare size={24} className="mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-bold text-stone-600">No active chats yet</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Join or host a plan. Chat unlocks when the crew fills up!</p>
            </div>
          )}
        </div>

        {/* Waiting / Locked Chats */}
        {waitingLocked.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock size={13} className="text-amber-600" />
              <span>Waiting for Quorum ({waitingLocked.length})</span>
            </h3>

            <div className="space-y-2">
              {waitingLocked.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setActiveChatPlanId(plan.id)}
                  className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/80 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-espresso">{plan.title}</h4>
                    <p className="text-[10px] text-amber-800 mt-0.5 font-medium">
                      🔒 Chat locked · {plan.acceptedMembers.length}/{plan.targetCapacity} accepted
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                    Waiting
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Plan is OPEN (Locked state)
  const isHost = activePlan.hostId === currentUser.id;
  const isUnlocked = activePlan.status === 'LOCKED_CHAT_ACTIVE';

  if (!isUnlocked) {
    const spotsLeft = activePlan.targetCapacity - activePlan.acceptedMembers.length;

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Back Button */}
        <button
          onClick={() => setActiveChatPlanId(null)}
          className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-800"
        >
          <ChevronLeft size={16} />
          <span>Back to Chats</span>
        </button>

        {/* Locked Room State Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
            🔒
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase">
              Waiting Room · Chat Locked
            </span>
            <h2 className="text-lg font-extrabold text-espresso mt-2">
              {activePlan.title}
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              This group chat unlocks automatically once the host accepts <strong>{spotsLeft} more member{spotsLeft === 1 ? '' : 's'}</strong>!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-stone-600">Accepted Members:</span>
              <span className="text-amber-700">{activePlan.acceptedMembers.length} / {activePlan.targetCapacity}</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex gap-1">
              {Array.from({ length: activePlan.targetCapacity }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-full rounded-full transition-all ${
                    idx < activePlan.acceptedMembers.length ? 'bg-amber-500' : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Accepted Attendees list */}
          <div className="pt-3 border-t border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              Confirmed in Room:
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {activePlan.acceptedMembers.map(id => {
                const u = getUserById(id);
                return (
                  <div key={id} className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 rounded-full border border-stone-200">
                    <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-[11px] font-bold text-stone-700">{u.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Instant Unlock Action */}
          {isHost && activePlan.acceptedMembers.length >= 2 && (
            <div className="pt-4 border-t border-stone-100 space-y-1.5">
              <button
                onClick={() => hostEarlyUnlockPlan(activePlan.id)}
                className="w-full max-w-sm mx-auto py-2.5 bg-espresso hover:bg-stone-800 text-cream font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Host: Lock Crew & Unlock Chat Now (Free)</span>
              </button>
              <p className="text-[10px] text-stone-400">
                You can start coordinating right now with your current {activePlan.acceptedMembers.length} members.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Plan is LOCKED_CHAT_ACTIVE (Full Realtime Group Chat)
  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)] bg-[#FDFBF7]">
      
      {/* Top Chat Bar */}
      <div className="bg-white border-b border-stone-200 p-3.5 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2.5 truncate">
          <button
            onClick={() => setActiveChatPlanId(null)}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="truncate">
            <h3 className="text-xs font-extrabold text-espresso truncate">{activePlan.title}</h3>
            <p className="text-[10px] text-stone-500 flex items-center gap-1">
              <MapPin size={10} className="text-amber-600" /> {activePlan.venueName} · {activePlan.acceptedMembers.length} Members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Post Meetup Karma trigger */}
          <button
            onClick={handleOpenKarma}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            <Star size={11} className="fill-amber-400" />
            <span>Rate Vibe</span>
          </button>

          {/* 1-Tap SOS Live Alert Button */}
          <button
            onClick={handleTriggerSOS}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all flex items-center gap-1"
          >
            <ShieldAlert size={12} />
            <span>SOS Share</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Safety & Icebreaker Banner */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-center space-y-1">
          <div className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1">
            <span>🎉 Group Unlocked!</span>
          </div>
          <p className="text-[11px] text-amber-800">
            <strong>Icebreaker:</strong> Introduce yourself and let the crew know what time you'll reach {activePlan.venueName}!
          </p>
        </div>

        {/* Message Feed */}
        {activePlan.messages?.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-semibold inline-block">
                  {msg.content}
                </span>
              </div>
            );
          }

          const isMe = msg.senderId === currentUser.id;
          const sender = getUserById(msg.senderId);

          return (
            <div
              key={msg.id}
              className={`flex gap-2 max-w-[82%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {!isMe && (
                <img
                  src={sender.avatar}
                  alt={sender.name}
                  className="w-7 h-7 rounded-full object-cover mt-1 flex-shrink-0"
                />
              )}

              <div>
                {!isMe && (
                  <div className="text-[10px] font-bold text-stone-500 mb-0.5 ml-1">
                    {sender.name} · {sender.company}
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-espresso text-cream rounded-br-xs font-medium'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs shadow-sm font-normal'
                  }`}
                >
                  {msg.content}
                </div>
                <div className={`text-[9px] text-stone-400 mt-0.5 px-1 ${isMe ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message your ${activePlan.acceptedMembers.length}-person crew...`}
          className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-amber-500 font-medium"
        />
        <button
          type="submit"
          className="p-2.5 bg-amber-500 hover:bg-amber-600 text-espresso rounded-xl font-bold transition-all shadow-sm flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>

      {/* SOS LIVE LOCATION MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-2 text-rose-700">
              <ShieldAlert size={24} />
              <h3 className="text-base font-extrabold">Emergency SOS Itinerary</h3>
            </div>

            <p className="text-xs text-stone-600">
              Share this live emergency summary with your parents, emergency contact, or roommate via WhatsApp/SMS:
            </p>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-800 select-all leading-relaxed">
              {sosContent}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopySOS}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 size={14} />
                <span>{copiedSOS ? '✓ Copied Alert Text!' : 'Copy to Share (WhatsApp/SMS)'}</span>
              </button>
              <button
                onClick={() => setSosModalOpen(false)}
                className="px-4 py-2.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

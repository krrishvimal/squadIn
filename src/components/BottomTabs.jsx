import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Radio, Users, MessageSquare, User } from 'lucide-react';

export const BottomTabs = () => {
  const { activeTab, setActiveTab, plans, currentUser, waves, hasWavedAt } = useApp();

  const normId = (id) => (id !== null && id !== undefined) ? String(id).trim().toLowerCase() : '';

  // Calculate incoming waves directed at current user that haven't been waved back to yet
  const incomingWavesCount = (waves || []).filter(w => 
    normId(w.toUserId) === normId(currentUser?.id) && !hasWavedAt(w.fromUserId)
  ).length;

  // Calculate unread or active badges
  const myCrewsCount = plans.filter(p => 
    normId(p.hostId) === normId(currentUser?.id) || p.acceptedMembers?.some(mId => normId(mId) === normId(currentUser?.id))
  ).length;

  const unlockedChatsCount = plans.filter(p => 
    p.status === 'LOCKED_CHAT_ACTIVE' && p.acceptedMembers?.some(mId => normId(mId) === normId(currentUser?.id))
  ).length;

  // Pending requests for plans I host
  const pendingRequestsCount = plans
    .filter(p => normId(p.hostId) === normId(currentUser?.id))
    .reduce((acc, p) => acc + (p.pendingRequests?.length || 0), 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t-2 border-stone-200/60 py-2 px-3 safe-area-pb shadow-lg shadow-stone-300/30 rounded-t-3xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Tab 1: Explore */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-amber-100 text-amber-900 font-extrabold scale-105 shadow-xs'
              : 'text-stone-400 hover:text-stone-700 font-bold'
          }`}
        >
          <Compass size={20} className={activeTab === 'explore' ? 'stroke-[2.5] text-amber-600' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* Tab 2: Squad Radar */}
        <button
          onClick={() => setActiveTab('radar')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-amber-100 text-amber-900 font-extrabold scale-105 shadow-xs'
              : 'text-stone-400 hover:text-stone-700 font-bold'
          }`}
        >
          <div className="relative">
            <Radio size={20} className={activeTab === 'radar' ? 'stroke-[2.5] text-amber-600' : 'stroke-2'} />
            {incomingWavesCount > 0 ? (
              <span className="absolute -top-1.5 -right-3 bg-amber-500 text-stone-900 font-extrabold text-[9px] px-1 rounded-full shadow-sm animate-bounce flex items-center gap-0.5">
                👋 {incomingWavesCount}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Radar</span>
        </button>

        {/* Tab 3: My Crews */}
        <button
          onClick={() => setActiveTab('my_crews')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'my_crews'
              ? 'bg-amber-100 text-amber-900 font-extrabold scale-105 shadow-xs'
              : 'text-stone-400 hover:text-stone-700 font-bold'
          }`}
        >
          <Users size={20} className={activeTab === 'my_crews' ? 'stroke-[2.5] text-amber-600' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight">Crews</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        {/* Tab 4: Chats */}
        <button
          onClick={() => setActiveTab('chats')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'chats'
              ? 'bg-amber-100 text-amber-900 font-extrabold scale-105 shadow-xs'
              : 'text-stone-400 hover:text-stone-700 font-bold'
          }`}
        >
          <MessageSquare size={20} className={activeTab === 'chats' ? 'stroke-[2.5] text-amber-600' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight">Chats</span>
          {unlockedChatsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
              {unlockedChatsCount}
            </span>
          )}
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-100 text-amber-900 font-extrabold scale-105 shadow-xs'
              : 'text-stone-400 hover:text-stone-700 font-bold'
          }`}
        >
          <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5] text-amber-600' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};

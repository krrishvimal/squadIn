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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 py-2 px-4 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Tab 1: Explore */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'explore'
              ? 'text-amber-600 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <Compass size={21} className={activeTab === 'explore' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] font-bold tracking-tight">Explore</span>
        </button>

        {/* Tab 2: Squad Radar */}
        <button
          onClick={() => setActiveTab('radar')}
          className={`relative flex flex-col items-center gap-1 transition-all ${
            activeTab === 'radar'
              ? 'text-amber-600 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <div className="relative">
            <Radio size={21} className={activeTab === 'radar' ? 'stroke-[2.5] text-amber-600' : 'stroke-2'} />
            {incomingWavesCount > 0 ? (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-900 font-extrabold text-[9px] px-1 py-0.2 rounded-full shadow-sm animate-bounce flex items-center gap-0.5">
                👋 {incomingWavesCount}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Radar</span>
        </button>

        {/* Tab 3: My Crews */}
        <button
          onClick={() => setActiveTab('my_crews')}
          className={`relative flex flex-col items-center gap-1 transition-all ${
            activeTab === 'my_crews'
              ? 'text-amber-600 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <Users size={21} className={activeTab === 'my_crews' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] font-bold tracking-tight">My Crews</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-amber-500 text-stone-900 rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        {/* Tab 4: Chats */}
        <button
          onClick={() => setActiveTab('chats')}
          className={`relative flex flex-col items-center gap-1 transition-all ${
            activeTab === 'chats'
              ? 'text-amber-600 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <MessageSquare size={22} className={activeTab === 'chats' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] font-bold tracking-tight">Chats</span>
          {unlockedChatsCount > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 bg-amber-500 text-stone-900 rounded-full text-[9px] font-extrabold flex items-center justify-center">
              {unlockedChatsCount}
            </span>
          )}
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'profile'
              ? 'text-amber-600 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <User size={22} className={activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] font-bold tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};

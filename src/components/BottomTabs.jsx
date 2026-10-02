import React from 'react';
import { Compass, Radar, Tent, MessageCircle, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sameId } from './DesignKit';
export function NavigationTabs({ className = 'bottom-tabs' }) {
  const { activeTab, setActiveTab, plans, currentUser, waves, hasWavedAt } = useApp();
  const requests = plans.filter(p => sameId(p.hostId, currentUser.id)).reduce((n, p) => n + (p.pendingRequests?.length || 0), 0);
  const incoming = (waves || []).filter(w => sameId(w.toUserId, currentUser.id) && !hasWavedAt(w.fromUserId)).length;
  const tabs = [
    { id: 'explore', label: 'Explore', Icon: Compass },
    { id: 'radar', label: 'Radar', Icon: Radar, count: incoming },
    { id: 'my_crews', label: 'Crews', Icon: Tent, count: requests },
    { id: 'chats', label: 'Chats', Icon: MessageCircle },
    { id: 'profile', label: 'Profile', Icon: UserRound },
  ];
  return <nav className={className} aria-label="Main navigation"><div className="tab-row">{tabs.map(({ id, label, Icon, count }) => <button key={id} className={`tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined}><span className="tab-icon"><Icon size={24} strokeWidth={1.65} />{count > 0 && <span className="tab-count">{count}</span>}</span><span>{label}</span></button>)}</div>{className === 'bottom-tabs' && <span className="home-indicator" />}</nav>;
}

export const BottomTabs = () => <NavigationTabs />;

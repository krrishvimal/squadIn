import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlanCard } from './PlanCard';
import { EmptyState, sameId } from './DesignKit';
export function MyCrewsView() {
  const { plans, currentUser, setShowCreateModal, setActiveTab, requireVerification } = useApp();
  const [tab, setTab] = useState('hosting');
  const groups = {
    hosting: plans.filter(p => sameId(p.hostId, currentUser.id)),
    joined: plans.filter(p => !sameId(p.hostId, currentUser.id) && p.acceptedMembers?.some(id => sameId(id, currentUser.id))),
    pending: plans.filter(p => !p.acceptedMembers?.some(id => sameId(id, currentUser.id)) && p.pendingRequests?.some(r => sameId(r.userId, currentUser.id))),
  };
  return <div className="screen crews-screen"><div className="screen-heading"><span className="eyebrow">GOOD PLANS. GREAT PEOPLE.</span><h1>🎪 My Crews</h1><p>A little group. A big weekend.</p></div><div className="segmented-tabs">{[['hosting', 'Hosting ⚡'], ['joined', 'Joined 🎟️'], ['pending', 'Pending ⏳']].map(([id, label]) => <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)} aria-pressed={tab === id}>{label}<span>{groups[id].length}</span></button>)}</div><div className="crew-list">{groups[tab].length ? groups[tab].map(plan => <PlanCard key={plan.id} plan={plan} crew />) : <EmptyState title={tab === 'pending' ? 'Nothing pending. All possibilities.' : 'No crews yet!'} description={tab === 'hosting' ? 'That coffee spot you love? Make it a plan. Your weekend crew is one post away.' : tab === 'pending' ? 'Your join requests will appear here while the host brings the crew together.' : 'Your next favourite people might be one weekend plan away.'} action={tab === 'hosting' ? () => requireVerification(() => setShowCreateModal(true), 'create_plan') : () => setActiveTab('explore')} actionLabel={tab === 'hosting' ? 'Post your first plan ☀' : 'Find your weekend crew'} />}</div>{groups[tab].length > 0 && <p className="footnote">Small crews. Shared plans. Real connections. ✧</p>}</div>;
}

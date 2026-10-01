import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlanCard } from './PlanCard';
import { Users, Crown, Clock, Plus } from 'lucide-react';

export const MyCrewsView = () => {
  const { plans, currentUser, setShowCreateModal } = useApp();
  const [subTab, setSubTab] = useState('hosting'); // 'hosting', 'joined', 'pending'

  const normId = (id) => (id !== null && id !== undefined) ? String(id).trim().toLowerCase() : '';

  const hostingPlans = plans.filter(p => normId(p.hostId) === normId(currentUser?.id));
  const joinedPlans = plans.filter(p => normId(p.hostId) !== normId(currentUser?.id) && p.acceptedMembers?.some(mId => normId(mId) === normId(currentUser?.id)));
  const pendingPlans = plans.filter(p => p.pendingRequests?.some(r => normId(r.userId) === normId(currentUser?.id)));

  // Count total pending requests for plans I host
  const pendingRequestsCount = hostingPlans.reduce((acc, p) => acc + (p.pendingRequests?.length || 0), 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-espresso">My Weekend Crews</h2>
          <p className="text-xs text-stone-500 font-medium">Manage the plans you are hosting and attending</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-espresso text-xs font-extrabold rounded-xl shadow-sm transition-all"
        >
          <Plus size={14} />
          <span>New Plan</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-stone-200/70 p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          onClick={() => setSubTab('hosting')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'hosting'
              ? 'bg-white text-espresso shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Crown size={13} className="text-amber-600" />
          <span>Hosting ({hostingPlans.length})</span>
          {pendingRequestsCount > 0 && (
            <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('joined')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'joined'
              ? 'bg-white text-espresso shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users size={13} className="text-emerald-600" />
          <span>Joined ({joinedPlans.length})</span>
        </button>

        <button
          onClick={() => setSubTab('pending')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'pending'
              ? 'bg-white text-espresso shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Clock size={13} className="text-stone-500" />
          <span>Requests ({pendingPlans.length})</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="space-y-3 pt-1">
        {subTab === 'hosting' && (
          hostingPlans.length > 0 ? (
            hostingPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-stone-300 p-6 space-y-3">
              <Crown size={32} className="mx-auto text-amber-500/60" />
              <div>
                <h4 className="text-xs font-bold text-stone-700">You are not hosting any plans yet</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">Post an activity (coffee, standup comedy, turf sports) and set your custom crew size!</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-espresso text-cream font-bold text-xs rounded-xl hover:bg-stone-800"
              >
                Post Your First Plan (Free)
              </button>
            </div>
          )
        )}

        {subTab === 'joined' && (
          joinedPlans.length > 0 ? (
            joinedPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-stone-300 p-6">
              <Users size={32} className="mx-auto text-stone-300 mb-2" />
              <h4 className="text-xs font-bold text-stone-700">No joined plans yet</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">Browse the explore feed to join weekend activities nearby.</p>
            </div>
          )
        )}

        {subTab === 'pending' && (
          pendingPlans.length > 0 ? (
            pendingPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-stone-300 p-6">
              <Clock size={32} className="mx-auto text-stone-300 mb-2" />
              <h4 className="text-xs font-bold text-stone-700">No pending join requests</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">When you request to join a plan, it will show up here until the host accepts.</p>
            </div>
          )
        )}
      </div>

    </div>
  );
};

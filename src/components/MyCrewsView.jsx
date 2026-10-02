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
          <h2 className="text-xl font-extrabold text-stone-900">🎪 My Crews</h2>
          <p className="text-xs text-stone-500 font-medium">Manage the plans you are hosting and attending</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-extrabold rounded-xl shadow-sm transition-all"
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
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Hosting ⚡</span>
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
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Joined 🎟️</span>
        </button>

        <button
          onClick={() => setSubTab('pending')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'pending'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Pending ⏳</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="space-y-3 pt-1">
        {subTab === 'hosting' && (
          hostingPlans.length > 0 ? (
            hostingPlans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
                <div className="flex">
                  <div className="flex-1 p-0">
                    <PlanCard plan={plan} />
                  </div>
                  <div className="w-6 border-l-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50 rounded-r-2xl">
                    <span className="text-stone-300 text-xs rotate-90 whitespace-nowrap font-bold">🎟️</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-stone-300 p-6 space-y-3">
              <span className="text-4xl mx-auto block">🔭</span>
              <div>
                <h4 className="text-sm font-extrabold text-stone-700">No crews yet! Explore plans or post your own ☀️</h4>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-amber-500 text-stone-900 font-extrabold text-xs rounded-xl hover:bg-amber-600 shadow-md"
              >
                Post Your First Plan
              </button>
            </div>
          )
        )}

        {subTab === 'joined' && (
          joinedPlans.length > 0 ? (
            joinedPlans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
                <div className="flex">
                  <div className="flex-1 p-0">
                    <PlanCard plan={plan} />
                  </div>
                  <div className="w-6 border-l-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50 rounded-r-2xl">
                    <span className="text-stone-300 text-xs rotate-90 whitespace-nowrap font-bold">🎟️</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-stone-300 p-6 space-y-3">
              <span className="text-4xl mx-auto block">🔭</span>
              <div>
                <h4 className="text-sm font-extrabold text-stone-700">No crews yet! Explore plans or post your own ☀️</h4>
              </div>
            </div>
          )
        )}

        {subTab === 'pending' && (
          pendingPlans.length > 0 ? (
            pendingPlans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
                <div className="flex">
                  <div className="flex-1 p-0">
                    <PlanCard plan={plan} />
                  </div>
                  <div className="w-6 border-l-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50 rounded-r-2xl">
                    <span className="text-stone-300 text-xs rotate-90 whitespace-nowrap font-bold">🎟️</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-stone-300 p-6 space-y-3">
              <span className="text-4xl mx-auto block">🔭</span>
              <div>
                <h4 className="text-sm font-extrabold text-stone-700">No crews yet! Explore plans or post your own ☀️</h4>
              </div>
            </div>
          )
        )}
      </div>

    </div>
  );
};

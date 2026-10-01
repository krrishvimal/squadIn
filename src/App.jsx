import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomTabs } from './components/BottomTabs';
import { PlanCard } from './components/PlanCard';
import { PlanDetailModal } from './components/PlanDetailModal';
import { CreatePlanModal } from './components/CreatePlanModal';
import { ChatView } from './components/ChatView';
import { MyCrewsView } from './components/MyCrewsView';
import { ProfileView } from './components/ProfileView';
import { SquadRadarView } from './components/SquadRadarView';
import { KarmaReviewModal } from './components/KarmaReviewModal';
import { ReportUserModal } from './components/ReportUserModal';
import { CommunityGuidelinesModal } from './components/CommunityGuidelinesModal';
import { OnboardingModal } from './components/OnboardingModal';
import { checkLinkedInCallback } from './lib/linkedinAuth';
import { Sparkles, Users, Filter, Compass, Plus, ShieldCheck, Navigation, Smartphone, X } from 'lucide-react';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Activities', icon: '✨' },
  { id: 'cafe', label: 'Cafe & Dinner', icon: '☕' },
  { id: 'sports', label: 'Sports & Run', icon: '🏸' },
  { id: 'concert', label: 'Concerts & Gigs', icon: '🎵' },
  { id: 'comedy', label: 'Standup & Comedy', icon: '🎭' },
  { id: 'arts', label: 'Workshops', icon: '🏺' },
  { id: 'hike', label: 'Treks & Walks', icon: '🥾' },
  { id: 'other', label: 'Other', icon: '✨' }
];

export function App() {
  const {
    activeTab,
    plans,
    categoryFilter,
    setCategoryFilter,
    womenOnlyFilter,
    setWomenOnlyFilter,
    sortByDistance,
    setSortByDistance,
    getPlanDistance,
    setShowCreateModal,
    selectedCity,
    userCoords,
    showGuidelinesModal,
    setShowGuidelinesModal,
    reportingUser,
    setReportingUser,
    blockedUserIds,
    updateCurrentUserProfile,
    showOnboardingModal,
    setShowOnboardingModal,
    onboardingReason,
    requireVerification,
    toastMessage,
    setToastMessage
  } = useApp();

  const [showPwaBanner, setShowPwaBanner] = useState(true);

  // Check for LinkedIn OAuth 2.0 OpenID Connect callback on load
  useEffect(() => {
    const callbackResult = checkLinkedInCallback();
    if (callbackResult?.success) {
      updateCurrentUserProfile({ linkedin_verified: true });
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  }, []);

  // Filter plans based on selected city, category, women-only toggle, and blocked users
  let filteredPlans = plans.filter(plan => {
    if (blockedUserIds?.includes(plan.hostId)) return false;
    if (selectedCity && plan.city && plan.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (categoryFilter !== 'all' && plan.category !== categoryFilter) return false;
    if (womenOnlyFilter && !plan.womenOnly) return false;
    return true;
  });

  // Sort by nearest if distance sorting enabled
  if (sortByDistance) {
    filteredPlans = [...filteredPlans].sort((a, b) => {
      const distA = parseFloat(getPlanDistance(a)) || 99;
      const distB = parseFloat(getPlanDistance(b)) || 99;
      return distA - distB;
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-espresso relative">
      
      {/* Realtime Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-amber-500/50 flex items-center gap-2 animate-bounce backdrop-blur-md max-w-sm text-center">
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar />

      {/* Main Tab Views */}
      <main className="animate-fade-in">
        
        {/* TAB 1: EXPLORE FEED */}
        {activeTab === 'explore' && (
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            
            {/* PWA Install Banner */}
            {showPwaBanner && (
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-espresso rounded-2xl p-3 px-4 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-espresso text-cream">
                    <Smartphone size={16} />
                  </div>
                  <div className="text-xs">
                    <span className="font-extrabold">Install as Mobile App:</span>
                    <span className="opacity-90 ml-1">Tap browser menu ➔ "Add to Home Screen"</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPwaBanner(false)}
                  className="p-1 text-espresso/70 hover:text-espresso rounded-md"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Hero Welcome Banner */}
            <div className="bg-gradient-to-br from-espresso via-stone-900 to-amber-950 rounded-3xl p-5 text-cream shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-espresso font-extrabold text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles size={11} /> 100% Free · Real-World Crews
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-white leading-snug">
                  No swiping. Just real weekend plans in {selectedCity}.
                </h1>
                <p className="text-xs text-stone-300 max-w-md">
                  Hosts set their crew size and accept applicants. Group chat unlocks when the crew is full!
                </p>
              </div>

              {/* Floating aesthetic graphics */}
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-20 pointer-events-none select-none">
                ☕🎭
              </div>
            </div>

            {/* Filters & Sorting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <Filter size={12} className="text-amber-600" />
                  <span>Filter Plans:</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Nearest Distance Toggle */}
                  <button
                    onClick={() => setSortByDistance(prev => !prev)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                      sortByDistance
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Navigation size={11} />
                    <span>Nearest First</span>
                  </button>

                  {/* Women-Only Toggle Pill */}
                  <button
                    onClick={() => setWomenOnlyFilter(prev => !prev)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                      womenOnlyFilter
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span>🚺</span>
                    <span>Women-Only</span>
                  </button>
                </div>
              </div>

              {/* Horizontal Filter Scroll */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORY_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setCategoryFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      categoryFilter === f.id
                        ? 'bg-amber-500 text-espresso shadow-sm scale-102 font-extrabold'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plans Feed */}
            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-center text-xs text-stone-500 font-bold px-1">
                <span>Upcoming Weekend Plans ({filteredPlans.length})</span>
                <span>{sortByDistance ? 'Sorted by Live GPS Distance' : 'Sorted by Date'}</span>
              </div>

              {filteredPlans.length > 0 ? (
                filteredPlans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-300 p-6 space-y-3">
                  <Compass size={32} className="mx-auto text-amber-500/60" />
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">No plans matching this filter</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">Be the first host to post a weekend activity in {selectedCity}!</p>
                  </div>
                  <button
                    onClick={() => requireVerification(() => setShowCreateModal(true), 'create_plan')}
                    className="px-4 py-2 bg-espresso text-cream font-bold text-xs rounded-xl hover:bg-stone-800 transition-all"
                  >
                    Post a Plan (Free)
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: SQUAD RADAR */}
        {activeTab === 'radar' && <SquadRadarView />}

        {/* TAB 3: MY CREWS */}
        {activeTab === 'my_crews' && <MyCrewsView />}

        {/* TAB 4: CHATS */}
        {activeTab === 'chats' && <ChatView />}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && <ProfileView />}

      </main>

      {/* Modals */}
      <PlanDetailModal />
      <CreatePlanModal />
      <KarmaReviewModal />
      <CommunityGuidelinesModal
        isOpen={showGuidelinesModal}
        onClose={() => setShowGuidelinesModal(false)}
      />
      <ReportUserModal
        isOpen={Boolean(reportingUser)}
        targetUser={reportingUser?.user}
        planId={reportingUser?.planId}
        onClose={() => setReportingUser(null)}
      />
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        reason={onboardingReason}
      />

      {/* Bottom Sticky Navigation */}
      <BottomTabs />

    </div>
  );
}
export default App;

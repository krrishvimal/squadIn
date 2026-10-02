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
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-stone-900 relative">
      
      {/* Realtime Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#FDFBF7] text-stone-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-stone-200 flex items-center gap-2 animate-bounce backdrop-blur-md max-w-sm text-center">
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors flex-shrink-0"
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
              <div className="bg-amber-500 text-stone-900 rounded-2xl p-3 px-4 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-700 text-white">
                    <Smartphone size={16} />
                  </div>
                  <div className="text-xs">
                    <span className="font-extrabold">Install as Mobile App:</span>
                    <span className="opacity-90 ml-1">Tap browser menu ➔ "Add to Home Screen"</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPwaBanner(false)}
                  className="p-1 text-stone-900/70 hover:text-stone-900 rounded-md"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Hero Welcome Banner */}
            <div className="pt-2 pb-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <span>☀️</span>
                <span>Your Weekend Starts Here</span>
              </h1>
              <p className="text-stone-500 text-xs sm:text-sm font-medium mt-1">
                Find your crew for this weekend in <span className="font-extrabold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-lg">{selectedCity}</span>
              </p>
            </div>

            {/* Horizontal Pastel Category Cards Carousel (Mockup Match) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <span>🎨</span>
                  <span>Explore Activities</span>
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSortByDistance(prev => !prev)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all flex items-center gap-1 ${
                      sortByDistance
                        ? 'bg-amber-500 text-stone-900 border-amber-600 shadow-xs'
                        : 'bg-white/80 text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <Navigation size={10} />
                    <span>Nearby</span>
                  </button>

                  <button
                    onClick={() => setWomenOnlyFilter(prev => !prev)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all flex items-center gap-1 ${
                      womenOnlyFilter
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-white/80 text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>🚺</span>
                    <span>Women-Only</span>
                  </button>
                </div>
              </div>

              {/* Chunky Pastel Category Cards */}
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 px-1">
                {[
                  { id: 'all', label: 'All', icon: '✨', bg: 'bg-[#FEF3C7]', border: 'border-[#FCD34D]', text: 'text-[#92400E]', ring: 'ring-amber-400' },
                  { id: 'cafe', label: 'Cafe', icon: '☕', bg: 'bg-[#EDE9FE]', border: 'border-[#DDD6FE]', text: 'text-[#6D28D9]', ring: 'ring-violet-400' },
                  { id: 'sports', label: 'Sports', icon: '⚽', bg: 'bg-[#D1FAE5]', border: 'border-[#A7F3D0]', text: 'text-[#047857]', ring: 'ring-emerald-400' },
                  { id: 'concert', label: 'Concerts', icon: '🎵', bg: 'bg-[#FFEDD5]', border: 'border-[#FED7AA]', text: 'text-[#C2410C]', ring: 'ring-orange-400' },
                  { id: 'comedy', label: 'Standup', icon: '😂', bg: 'bg-[#FEF9C3]', border: 'border-[#FDE047]', text: 'text-[#A16207]', ring: 'ring-yellow-400' },
                  { id: 'arts', label: 'Workshops', icon: '🎨', bg: 'bg-[#FCE7F3]', border: 'border-[#FBCFE8]', text: 'text-[#BE185D]', ring: 'ring-pink-400' },
                  { id: 'hike', label: 'Treks', icon: '🥾', bg: 'bg-[#ECFCCB]', border: 'border-[#D9F99D]', text: 'text-[#4D7C0F]', ring: 'ring-lime-400' },
                  { id: 'other', label: 'Other', icon: '✨', bg: 'bg-[#FFE4E6]', border: 'border-[#FECDD3]', text: 'text-[#BE123C]', ring: 'ring-rose-400' }
                ].map(f => {
                  const isSelected = categoryFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setCategoryFilter(f.id)}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-[78px] rounded-2xl border-2 transition-all active:scale-95 flex-shrink-0 cursor-pointer ${
                        isSelected
                          ? `${f.bg} ${f.border} ring-2 ${f.ring} shadow-md -translate-y-1`
                          : 'bg-white border-stone-200/90 hover:bg-stone-50 shadow-xs'
                      }`}
                    >
                      <span className="text-2xl mb-0.5 filter drop-shadow-xs">{f.icon}</span>
                      <span className={`text-[11px] font-extrabold ${isSelected ? f.text : 'text-stone-700'}`}>
                        {f.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plans Feed */}
            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center text-[11px] text-stone-500 font-extrabold px-1">
                <span>Upcoming Weekend Plans ({filteredPlans.length})</span>
                <span>{sortByDistance ? '📍 Sorted by Distance' : '📅 Sorted by Date'}</span>
              </div>

              {filteredPlans.length > 0 ? (
                filteredPlans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))
              ) : (
                /* Warm Postcard Empty State matching mockup */
                <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-amber-200 p-6 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner border border-amber-200">
                    🎪
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-stone-900">Your Weekend Canvas is Blank!</h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Be the awesome pioneer who posts the first weekend meetup in {selectedCity}!
                    </p>
                  </div>
                  <button
                    onClick={() => requireVerification(() => setShowCreateModal(true), 'create_plan')}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>✨ Post a Weekend Plan (Free)</span>
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

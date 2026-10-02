import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Navigation, ShieldCheck, X, Sun } from 'lucide-react';
import { useApp, isPlanExpired } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomTabs } from './components/BottomTabs';
import { PlanCard } from './components/PlanCard';
import { PlanDetailModal } from './components/PlanDetailModal';
import { CreatePlanModal } from './components/CreatePlanModal';
import { ChatView } from './components/ChatView';
import { MyCrewsView } from './components/MyCrewsView';
import { ProfileView } from './components/ProfileView';
import { SquadRadarView } from './components/SquadRadarView';
import { OnboardingModal } from './components/OnboardingModal';
import { ActivityArt, CityPicker, EmptyState, CATEGORIES } from './components/DesignKit';
import { checkLinkedInCallback } from './lib/linkedinAuth';
import { IS_DESIGN_PREVIEW } from './designPreview';

const KarmaReviewModal = React.lazy(() => import('./components/KarmaReviewModal').then(m => ({ default: m.KarmaReviewModal })));
const ReportUserModal = React.lazy(() => import('./components/ReportUserModal').then(m => ({ default: m.ReportUserModal })));
const CommunityGuidelinesModal = React.lazy(() => import('./components/CommunityGuidelinesModal').then(m => ({ default: m.CommunityGuidelinesModal })));



export function App() {
  const app = useApp();
  const { activeTab, plans, categoryFilter, setCategoryFilter, womenOnlyFilter, setWomenOnlyFilter, sortByDistance, setSortByDistance, getPlanDistance, setShowCreateModal, selectedCity, showGuidelinesModal, setShowGuidelinesModal, reportingUser, setReportingUser, blockedUserIds, updateCurrentUserProfile, showOnboardingModal, setShowOnboardingModal, onboardingReason, requireVerification, toastMessage, setToastMessage } = app;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);
  useEffect(() => {
    const result = checkLinkedInCallback();
    if (result?.success) {
      updateCurrentUserProfile({ linkedin_verified: true });
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  }, []);
  const filteredPlans = useMemo(() => {
    let result = plans.filter(plan => {
      if (blockedUserIds?.includes(plan.hostId) || plan.status === 'COMPLETED' || isPlanExpired(plan)) return false;
      if (selectedCity && plan.city && plan.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      if (categoryFilter !== 'all' && plan.category !== categoryFilter) return false;
      return !womenOnlyFilter || plan.womenOnly;
    });
    if (sortByDistance) {
      result = [...result].sort((a, b) => (parseFloat(getPlanDistance(a)) || 99) - (parseFloat(getPlanDistance(b)) || 99));
    }
    return result;
  }, [plans, blockedUserIds, selectedCity, categoryFilter, womenOnlyFilter, sortByDistance, getPlanDistance]);
  const post = () => requireVerification(() => setShowCreateModal(true), 'create_plan');
  return <div className="weekend-world">
    <div className={`app-shell tab-${activeTab}`}>
      <Navbar />
      {IS_DESIGN_PREVIEW && <div className="preview-strip">Design preview · sample community · saved on this device only</div>}
      <main key={activeTab} className="app-main animate-fade-in">
        {activeTab === 'explore' && <div className="screen explore-screen">
          <div className="explore-hero"><span className="eyebrow">MAKE ROOM FOR A LITTLE FUN</span><h1>Your Weekend<span className="hero-title-break"> </span>Starts Here <Sun className="hero-sun" size={38} /></h1><p>Real plans. Real people. Your kind of crew.</p><CityPicker /><span className="hero-spark">✧</span></div>
          <div className="category-carousel" aria-label="Filter by activity"><button className={`category-tile all-tile ${categoryFilter === 'all' ? 'selected' : ''}`} onClick={() => setCategoryFilter('all')} aria-pressed={categoryFilter === 'all'}><ActivityArt type="other" size={38} /><span>All plans</span></button>{CATEGORIES.map(cat => <button key={cat.id} className={`category-tile ${categoryFilter === cat.id ? 'selected' : ''}`} style={{ '--category-color': cat.color }} onClick={() => setCategoryFilter(cat.id)} aria-pressed={categoryFilter === cat.id}><ActivityArt type={cat.id} size={40} /><span>{cat.label}</span></button>)}</div>
          <div className="feed-controls"><button className={`filter-pill ${womenOnlyFilter ? 'selected-pink' : ''}`} onClick={() => setWomenOnlyFilter(v => !v)} aria-pressed={womenOnlyFilter}><ShieldCheck size={14} />Women only</button><button className={`filter-pill ${sortByDistance ? 'selected' : ''}`} onClick={() => setSortByDistance(v => !v)} aria-pressed={sortByDistance}><Navigation size={13} />Near me</button><span className="feed-count">{filteredPlans.length} plans</span></div>
          <div className="feed-label"><h2>A weekend worth stepping out for</h2><span>✦</span></div>
          <div className="plans-feed">{filteredPlans.length ? filteredPlans.map((plan, index) => <PlanCard key={plan.id} plan={plan} index={index} />) : <EmptyState title={categoryFilter !== 'all' || womenOnlyFilter ? 'A little quiet here…' : 'Your weekend is a blank postcard'} description={categoryFilter !== 'all' || womenOnlyFilter ? 'Try another activity or make the plan you wish was here.' : `Be the first to bring a little weekend magic to ${selectedCity}.`} action={post} actionLabel="Post a weekend plan ☀" />}</div>
          <div className="feed-safety"><ShieldCheck size={17} /><span>Small crews. Public places. Always platonic.</span></div>
          <button className="floating-post" onClick={post} aria-label="Post a weekend plan"><Plus size={29} /><span className="floating-spark">✧</span></button>
        </div>}
        {activeTab === 'radar' && <SquadRadarView />}
        {activeTab === 'my_crews' && <MyCrewsView />}
        {activeTab === 'chats' && <ChatView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>
      <BottomTabs />
    </div>
    {toastMessage && <div className="toast" role="status"><span>{toastMessage}</span><button className="icon-button" onClick={() => setToastMessage(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}
    <PlanDetailModal /><CreatePlanModal />
    <React.Suspense fallback={null}>
      <KarmaReviewModal />
      <CommunityGuidelinesModal isOpen={showGuidelinesModal} onClose={() => setShowGuidelinesModal(false)} />
      <ReportUserModal isOpen={Boolean(reportingUser)} targetUser={reportingUser?.user} planId={reportingUser?.planId} onClose={() => setReportingUser(null)} />
    </React.Suspense>
    <OnboardingModal isOpen={showOnboardingModal} onClose={() => setShowOnboardingModal(false)} reason={onboardingReason} />
  </div>;
}
export default App;

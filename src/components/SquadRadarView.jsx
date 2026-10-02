import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm } from '../venueData';
import {
  Radio,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Star,
  Users,
  Navigation,
  CheckCircle2,
  Send,
  Plus,
  Filter,
  X,
  MapPin,
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';

export const PASSION_TO_CATEGORY_MAP = {
  '☕ Specialty Coffee': 'cafe',
  '🍕 Food Walks': 'cafe',
  '🏸 Badminton': 'sports',
  '🏃 Running 5K': 'sports',
  '🎭 Standup Comedy': 'comedy',
  '🎬 Indie Cinema': 'comedy',
  '🏺 Pottery & Art': 'arts',
  '🥾 Weekend Treks': 'hike',
  '🎵 Concerts & Gigs': 'concert',
  '💻 Tech & Startups': 'other'
};

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All Passions', icon: '✨' },
  { id: 'cafe', label: 'Coffee & Food', icon: '☕' },
  { id: 'sports', label: 'Sports & Run', icon: '🏸' },
  { id: 'comedy', label: 'Standup & Cinema', icon: '🎭' },
  { id: 'arts', label: 'Pottery & Art', icon: '🏺' },
  { id: 'hike', label: 'Weekend Treks', icon: '🥾' },
  { id: 'concert', label: 'Concerts & Gigs', icon: '🎵' },
  { id: 'other', label: 'Tech & Meetups', icon: '💻' }
];

export const SquadRadarView = () => {
  const {
    radarMembers,
    selectedCity,
    isRadarBroadcastOn,
    setIsRadarBroadcastOn,
    invitedUserIds,
    sendCrewInvite,
    plans,
    currentUser,
    userCoords,
    isLocating,
    requestLiveLocation,
    setShowCreateModal,
    requireVerification,
    sendWave,
    hasWavedAt,
    hasReceivedWaveFrom,
    isMutualWave
  } = useApp();

  const [selectedCat, setSelectedCat] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState(15); // 5 | 15 | 999 (Whole City)
  const [womenOnly, setWomenOnly] = useState(false);
  const [viewMode, setViewMode] = useState('radar'); // 'radar' | 'cards'
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [selectedPlanForInvite, setSelectedPlanForInvite] = useState('');

  // Host's open plans available for recruiting
  const hostOpenPlans = plans.filter(
    p => p.hostId === currentUser.id && p.status !== 'COMPLETED'
  );

  // Calculate dynamic live distance from user's current GPS coordinates
  const getMemberDistance = (member) => {
    if (!userCoords?.lat || !userCoords?.lng) return member.distanceKm;
    const mLat = userCoords.lat + (member.latOffset || 0);
    const mLng = userCoords.lng + (member.lngOffset || 0);
    const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, mLat, mLng);
    return dist && dist > 0 ? dist : member.distanceKm;
  };

  // Filter members by city, selected weekend passion category, women-only, and distance radius
  const filteredMembers = radarMembers.filter(m => {
    if (m.city) {
      const c1 = m.city.toLowerCase().replace(/[^a-z]/g, '');
      const c2 = selectedCity.toLowerCase().replace(/[^a-z]/g, '');
      const matchesCity = c1 === c2 || c1.includes(c2) || c2.includes(c1);
      if (!matchesCity) return false;
    }
    
    // Category & Weekend Passion matching
    if (selectedCat !== 'all') {
      const memberCats = [
        m.primaryCat,
        ...(m.interests || []).map(p => PASSION_TO_CATEGORY_MAP[p] || p)
      ].filter(Boolean);

      const matchesPassion = memberCats.some(c => 
        c.toLowerCase() === selectedCat.toLowerCase() ||
        c.toLowerCase().includes(selectedCat.toLowerCase()) ||
        selectedCat.toLowerCase().includes(c.toLowerCase())
      );

      if (!matchesPassion) return false;
    }

    if (womenOnly && m.gender !== 'female') return false;
    
    // Radius filter
    const liveDist = getMemberDistance(m);
    if (distanceFilter !== 999 && liveDist > distanceFilter) return false;
    return true;
  });

  const handleOpenCandidate = (candidate) => {
    const liveDist = getMemberDistance(candidate);
    setActiveCandidate({ ...candidate, distanceKm: liveDist });
    if (hostOpenPlans.length > 0) {
      setSelectedPlanForInvite(hostOpenPlans[0].id);
    }
  };

  const handleSendInvite = (candidateId) => {
    if (!selectedPlanForInvite) {
      alert('Please select or create a plan to invite this member to.');
      return;
    }
    requireVerification(() => {
      sendCrewInvite(candidateId, selectedPlanForInvite);
    }, 'radar_invite');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 animate-fade-in">
      
      {/* Header matching Mockup 2 Screen 2 */}
      <div className="flex items-center justify-between px-1 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <span>🧭</span>
            <span>Who's Around?</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-bold mt-0.5">
            {filteredMembers.length} active verified members near you in <span className="text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md">{selectedCity}</span>
          </p>
        </div>

        {/* GPS Sync & Visibility status */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => requestLiveLocation()}
            disabled={isLocating}
            className="p-2 rounded-xl bg-white border-2 border-stone-200/90 text-stone-700 hover:text-amber-700 shadow-xs active:scale-95 transition-all"
            title="Recalibrate GPS"
          >
            <Navigation size={13} className={isLocating ? "animate-spin text-amber-500" : "text-amber-600"} />
          </button>
          
          <button
            onClick={() => setIsRadarBroadcastOn(prev => !prev)}
            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border-2 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              isRadarBroadcastOn
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRadarBroadcastOn ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            <span>{isRadarBroadcastOn ? 'Visible' : 'Hidden'}</span>
          </button>
        </div>
      </div>

      {/* Streamlined Controls & Radius Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Radius filter pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-stone-200/80 shadow-xs">
          {[
            { id: 5, label: '📍 5 km' },
            { id: 15, label: '⚡ 15 km' },
            { id: 999, label: '🏙️ City' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setDistanceFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                distanceFilter === pill.id
                  ? 'bg-amber-500 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* View Mode & Women-Only */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setWomenOnly(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
              womenOnly
                ? 'bg-rose-500 text-white border-rose-600'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span>🚺</span>
            <span>Women-Only</span>
          </button>

          <button
            onClick={() => setViewMode(prev => prev === 'radar' ? 'cards' : 'radar')}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white border-2 border-stone-200 hover:bg-stone-50 text-stone-700 shadow-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            {viewMode === 'radar' ? <Layers size={13} /> : <Radio size={13} />}
            <span>{viewMode === 'radar' ? `List (${filteredMembers.length})` : 'Radar'}</span>
          </button>
        </div>
      </div>

      {/* RADAR CANVAS VIEW */}
      {viewMode === 'radar' && (
        <>
          <div className="bg-[#FAF6EE] rounded-3xl p-4 border-2 border-amber-200/80 shadow-sm relative min-h-[440px] sm:min-h-[480px] flex items-center justify-center overflow-hidden">
          
          {/* Concentric Radar Distance Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer Ring */}
            <div className="w-[340px] h-[340px] rounded-full border-2 border-dashed border-amber-200/60 flex items-center justify-center relative">
              <span className="absolute top-2 text-[9px] font-bold italic text-stone-400 tracking-wider">
                {distanceFilter === 5 ? '~5 KM (NEIGHBORHOOD)' : distanceFilter === 15 ? '~15 KM (CITY HUBS)' : `~${selectedCity.toUpperCase()} (WHOLE CITY)`}
              </span>
              
              {/* Middle Ring */}
              <div className="w-[230px] h-[230px] rounded-full border border-dashed border-amber-200/60 flex items-center justify-center relative">
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-stone-400 italic whitespace-nowrap bg-[#FDFBF7] px-1.5">Quick Ride 🛺</span>
                
                {/* Inner Ring */}
                <div className="w-[120px] h-[120px] rounded-full border border-dashed border-amber-200/60 flex items-center justify-center relative">
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-stone-400 italic whitespace-nowrap bg-[#FDFBF7] px-1.5">Walking Distance 🚶</span>
                </div>
              </div>
            </div>

            {/* Scanning Radar Sweep Line */}
            <div className="absolute w-[340px] h-[340px] rounded-full border-t-2 border-amber-400 animate-spin opacity-30 pointer-events-none" style={{ animationDuration: '8s' }} />
          </div>

          {/* Center Point: Host / You */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 p-0.5 shadow-md ring-4 ring-amber-100">
              <img
                src={currentUser.avatar}
                alt="You"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-[10px] font-extrabold text-amber-600 mt-1">You 📍</span>
          </div>

          {/* Plotted Nearby Candidate Bubbles */}
          {filteredMembers.map((member, idx) => {
            const liveDist = getMemberDistance(member);

            // Compute exact radial radius from center in pixels matching concentric rings:
            let radialPx;
            const maxR = distanceFilter === 999 ? 35 : distanceFilter;
            const normDist = Math.min(maxR, liveDist) / maxR;
            radialPx = 35 + normDist * 130; // Scale dynamically between 35px and 165px

            // Angular dispersion for clean visual separation
            const angles = [35, 145, 215, 310, 85, 260, 180, 0];
            const angle = angles[idx % angles.length];
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * radialPx;
            const y = Math.sin(rad) * radialPx;

            const isInvited = invitedUserIds.includes(member.id);

            return (
              <div
                key={member.id}
                onClick={() => handleOpenCandidate(member)}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                className="absolute z-20 cursor-pointer group transition-all duration-300 hover:scale-110"
              >
                <div className="relative flex flex-col items-center">
                  
                  {/* Activity / Passion Badge Floating above avatar */}
                  <div className="mb-1 px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700 text-[9.5px] font-extrabold shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <span>{member.primaryActivity || (member.interests && member.interests.length > 0 ? member.interests[0] : '✨ Weekend Passion')}</span>
                  </div>

                  {/* Avatar Bubble */}
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full p-0.5 shadow-md transition-all ${
                      isInvited
                        ? 'bg-emerald-500 ring-2 ring-emerald-300'
                        : 'bg-gradient-to-tr from-amber-500 to-amber-300 ring-2 ring-white group-hover:ring-amber-400'
                    }`}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>

                    {/* Verified check badge */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-[9px] font-extrabold">
                      ✓
                    </div>
                    {hasReceivedWaveFrom(member.id) && !isMutualWave(member.id) && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] shadow-lg animate-pulse" title={`${member.name} waved at you!`}>
                        👋
                      </div>
                    )}
                    {isMutualWave(member.id) ? (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-[9px] shadow-lg ring-2 ring-emerald-300 animate-pulse" title="Squad Up!">
                        🤝
                      </div>
                    ) : hasWavedAt(member.id) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-[8px] shadow-lg">
                        👋
                      </div>
                    )}
                  </div>

                  {/* Name & Dynamic Distance Tag */}
                  <div className="mt-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[9px] font-bold text-stone-800 flex items-center gap-1 whitespace-nowrap shadow-sm border border-stone-100">
                    <span>{member.name.split(' ')[0]}</span>
                    <span className="text-amber-600 font-extrabold">· {liveDist}km</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="absolute bottom-5 z-20 px-4 py-2 bg-white/90 border border-amber-200 rounded-2xl text-center backdrop-blur-sm max-w-xs animate-fade-in shadow-sm">
              <p className="text-xs font-bold text-amber-700">
                🧭 Squad Radar is Scanning in {selectedCity}
              </p>
              <p className="text-xs text-stone-400 mt-0.5 leading-tight">
                As nearby verified members open the app, they will appear on your distance rings.
              </p>
            </div>
          )}
        </div>
        <p className="text-center text-stone-400 text-xs font-medium mt-2">Tap a member to say hi 👋</p>
        </>
      )}

      {/* LIST / GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
              <div className="text-4xl">🧭</div>
              <h3 className="font-extrabold text-espresso text-base">No active members matching filters</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try switching activity categories or expanding your radius.
              </p>
            </div>
          ) : (
            filteredMembers.map(member => {
              const isInvited = invitedUserIds.includes(member.id);

              return (
                <div
                  key={member.id}
                  onClick={() => handleOpenCandidate(member)}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-stone-100 shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border border-white">
                        <ShieldCheck size={11} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-espresso text-sm">{member.name}</h3>
                        <span className="text-[11px] font-bold text-stone-400">({member.age})</span>
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {getMemberDistance(member)} km away
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                        <Briefcase size={12} className="text-stone-400 flex-shrink-0" />
                        <span className="font-semibold">{member.role}</span>
                        <span className="text-stone-400">@ {member.company}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                          {member.primaryActivity}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          📍 {member.neighborhood}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Invite action button */}
                  <div className="flex-shrink-0">
                    {isInvited ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-extrabold flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-700" />
                        <span>Invited</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCandidate(member);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-espresso text-xs font-extrabold shadow-sm transition-all flex items-center gap-1"
                      >
                        <Send size={12} />
                        <span>Invite</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CANDIDATE PROFILE BOTTOM SHEET MODAL */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#FDFBF7] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck size={13} className="text-emerald-600" /> Verified Candidate
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  📍 {activeCandidate.distanceKm} km away
                </span>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="overflow-y-auto p-5 space-y-4">
              
              {/* Profile Card Header */}
              <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-start gap-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 p-0.5 shadow-sm flex-shrink-0">
                  <img
                    src={activeCandidate.avatar}
                    alt={activeCandidate.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-stone-900 truncate">{activeCandidate.name}</h2>
                    <span className="text-xs font-bold text-stone-400">({activeCandidate.age})</span>
                  </div>

                  <div className="text-sm font-medium text-stone-500 flex items-center gap-1 mt-0.5">
                    <Briefcase size={12} className="text-amber-500 flex-shrink-0" />
                    <span>{activeCandidate.role} @ <strong>{activeCandidate.company}</strong></span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-stone-500">
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      <CheckCircle2 size={11} /> Work Email & ID Verified
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-extrabold">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      <span>{activeCandidate.karmaScore} ({activeCandidate.meetupsAttended} meetups)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Weekend Goals */}
              <div className="bg-white p-4 rounded-2xl border border-stone-100 space-y-2 shadow-sm">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  About & Weekend Goals
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  "{activeCandidate.bio}"
                </p>
                
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Location Area:</span>
                  <span className="font-bold text-stone-800">📍 {activeCandidate.neighborhood}</span>
                </div>
              </div>

              {/* Wave Action — lightweight connection without needing a plan */}
              <div className="mb-3">
                {isMutualWave(activeCandidate.id) ? (
                  // Mutual wave! Show squad-up state (NOT dating "match" language)
                  <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-center shadow-md animate-fade-in">
                    <div className="text-3xl mb-1 animate-bounce">🤝</div>
                    <p className="text-emerald-950 font-black text-base tracking-tight">Squad Up!</p>
                    <p className="text-emerald-800 font-bold text-xs mt-1">You're both interested in similar plans! Create a weekend crew together.</p>
                    <button
                      onClick={() => {
                        setActiveCandidate(null);
                        requireVerification(() => setShowCreateModal(true), 'create_plan');
                      }}
                      className="mt-2.5 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-[0.98]"
                    >
                      <span>📋</span>
                      <span>Create a Plan Together</span>
                    </button>
                  </div>
                ) : hasWavedAt(activeCandidate.id) ? (
                  // Already waved, waiting
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 text-center shadow-sm">
                    <p className="text-amber-950 font-extrabold text-sm flex items-center justify-center gap-1.5">
                      <span className="text-base">👋</span> Interest Sent!
                    </p>
                    <p className="text-amber-800 font-bold text-xs mt-0.5">Waiting for {activeCandidate.name} to respond — you'll both unlock plan invites</p>
                  </div>
                ) : hasReceivedWaveFrom(activeCandidate.id) ? (
                  // Someone waved at YOU! Prompt to wave back!
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl p-4 text-center space-y-2 shadow-lg animate-pulse">
                    <p className="text-emerald-950 font-black text-sm flex items-center justify-center gap-1.5">
                      <span className="text-lg animate-bounce">👋</span> {activeCandidate.name} wants to squad up!
                    </p>
                    <button
                      onClick={() => {
                        requireVerification(() => {
                          sendWave(activeCandidate.id);
                        }, 'radar_invite');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
                    >
                      <span className="text-lg">🤝</span>
                      <span>Wave Back — Unlock Plan Invites</span>
                    </button>
                  </div>
                ) : (
                  // Can wave
                  <button
                    onClick={() => {
                      requireVerification(() => {
                        sendWave(activeCandidate.id);
                      }, 'radar_invite');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all active:scale-[0.98]"
                  >
                    <span className="text-lg">👋</span>
                    <span>Interested in Similar Plans</span>
                  </button>
                )}
              </div>

              {/* Recruitment / Invite to Crew Box */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Send size={15} className="text-amber-700" />
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                      Invite to Your Weekend Crew
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800">Host Power</span>
                </div>

                {hostOpenPlans.length === 0 ? (
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-center space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      You don't have an open plan created yet.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCandidate(null);
                        requireVerification(() => setShowCreateModal(true), 'create_plan');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-extrabold transition-colors inline-flex items-center gap-1"
                    >
                      <Plus size={13} /> Post a Weekend Plan First
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Select which plan to invite {activeCandidate.name} to:
                      </label>
                      <select
                        value={selectedPlanForInvite}
                        onChange={(e) => setSelectedPlanForInvite(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-600 text-stone-900 shadow-sm"
                      >
                        {hostOpenPlans.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.acceptedMembers.length}/{p.targetCapacity} spots)
                          </option>
                        ))}
                      </select>
                    </div>

                    {invitedUserIds.includes(activeCandidate.id) ? (
                      <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-extrabold text-center flex items-center justify-center gap-1.5 border border-emerald-300">
                        <CheckCircle2 size={15} className="text-emerald-700" />
                        <span>Crew Invite Sent! Candidate will be notified.</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendInvite(activeCandidate.id)}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send size={14} />
                        <span>Send 1-Tap Crew Invite</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

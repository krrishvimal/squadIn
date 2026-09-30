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

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All Activities', icon: '✨' },
  { id: 'cafe', label: 'Cafe & Brunch', icon: '☕' },
  { id: 'sports', label: 'Sports & Turf', icon: '🏸' },
  { id: 'comedy', label: 'Standup & Comedy', icon: '🎭' },
  { id: 'concert', label: 'Concerts & Gigs', icon: '🎵' },
  { id: 'arts', label: 'Workshops', icon: '🏺' }
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
    setShowCreateModal
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

  // Filter members by city, category, women-only, and distance radius
  const filteredMembers = radarMembers.filter(m => {
    if (m.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (selectedCat !== 'all' && m.primaryCat !== selectedCat && !m.interests?.includes(selectedCat)) return false;
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
    sendCrewInvite(candidateId, selectedPlanForInvite);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 animate-fade-in">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-espresso text-cream rounded-3xl p-5 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-espresso font-extrabold text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
              <Radio size={12} className="animate-pulse" /> Live Squad Radar
            </span>

            {/* Broadcast status toggle */}
            <button
              onClick={() => setIsRadarBroadcastOn(prev => !prev)}
              className={`text-[11px] font-extrabold px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                isRadarBroadcastOn
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isRadarBroadcastOn ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'}`} />
              <span>{isRadarBroadcastOn ? 'You are Visible on Radar' : 'Radar Hidden'}</span>
            </button>
          </div>

          <h1 className="text-xl font-extrabold text-white leading-tight">
            Discover Verified Members Nearby
          </h1>
          <p className="text-xs text-stone-300 max-w-md leading-relaxed">
            These members in <strong className="text-amber-300">{selectedCity}</strong> are looking for a weekend crew. Tap any profile to invite them to your plan!
          </p>
        </div>

        {/* Floating subtle aesthetic badge */}
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 pointer-events-none">
          🧭
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          
          {/* View mode switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                viewMode === 'radar'
                  ? 'bg-white text-espresso shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Radio size={12} />
              <span>Radar View</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                viewMode === 'cards'
                  ? 'bg-white text-espresso shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers size={12} />
              <span>List View ({filteredMembers.length})</span>
            </button>
          </div>

          {/* Women Only filter */}
          <button
            onClick={() => setWomenOnly(prev => !prev)}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1 ${
              womenOnly
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
            }`}
          >
            <span>🚺</span>
            <span>Women-Only</span>
          </button>
        </div>

        {/* Discovery Radius 3-Pill Filter Row */}
        <div className="flex items-center justify-between gap-2 p-2 bg-stone-100/80 rounded-2xl border border-stone-200/80">
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-stone-600 pl-1">
            <Navigation size={12} className="text-amber-600" />
            <span>Radius:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {[
              { id: 5, label: '📍 5 km', desc: 'Neighborhood' },
              { id: 15, label: '⚡ 15 km', desc: 'City Hubs' },
              { id: 999, label: '🏙️ Whole City', desc: 'All Areas' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setDistanceFilter(pill.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all ${
                  distanceFilter === pill.id
                    ? 'bg-espresso text-cream shadow-sm ring-1 ring-stone-900'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ACTIVITY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedCat(f.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedCat === f.id
                  ? 'bg-amber-500 text-espresso font-extrabold shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RADAR CANVAS VIEW */}
      {viewMode === 'radar' && (
        <div className="bg-gradient-to-b from-stone-900 to-espresso rounded-3xl p-4 border border-stone-800 shadow-xl relative min-h-[380px] flex items-center justify-center overflow-hidden">
          
          {/* Concentric Radar Distance Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer Ring */}
            <div className="w-[340px] h-[340px] rounded-full border border-dashed border-amber-500/20 flex items-center justify-center">
              <span className="absolute top-2 text-[9px] font-bold text-amber-500/40 tracking-wider">
                {distanceFilter === 5 ? '~5 KM (NEIGHBORHOOD)' : distanceFilter === 15 ? '~15 KM (CITY HUBS)' : `~${selectedCity.toUpperCase()} (WHOLE CITY)`}
              </span>
              
              {/* Middle Ring */}
              <div className="w-[230px] h-[230px] rounded-full border border-amber-500/30 flex items-center justify-center">
                <span className="absolute top-16 text-[9px] font-bold text-amber-500/50 tracking-wider">
                  {distanceFilter === 5 ? '~3 KM' : distanceFilter === 15 ? '~5 KM' : '~15 KM'}
                </span>
                
                {/* Inner Ring */}
                <div className="w-[120px] h-[120px] rounded-full border border-amber-400/40 flex items-center justify-center">
                  <span className="absolute top-3 text-[8px] font-bold text-amber-400/60 tracking-wider">
                    {distanceFilter === 5 ? '~1 KM' : distanceFilter === 15 ? '~2 KM' : '~5 KM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scanning Radar Sweep Line */}
            <div className="absolute w-[340px] h-[340px] rounded-full border-t-2 border-amber-400/40 animate-spin opacity-40 pointer-events-none" style={{ animationDuration: '8s' }} />
          </div>

          {/* Center Point: Host / You */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500 p-0.5 shadow-lg shadow-amber-500/50 ring-4 ring-amber-400/30">
              <img
                src={currentUser.avatar}
                alt="You"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="mt-1 px-2 py-0.5 rounded-full bg-stone-900/90 border border-amber-500/40 text-[9px] font-extrabold text-amber-300">
              YOU (Host)
            </div>
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
                  
                  {/* Activity Badge Floating above avatar */}
                  <div className="mb-1 px-2 py-0.5 rounded-full bg-stone-900/95 border border-amber-400 text-amber-300 text-[9.5px] font-extrabold shadow-md flex items-center gap-1 whitespace-nowrap">
                    <span>{member.primaryActivity}</span>
                  </div>

                  {/* Avatar Bubble */}
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full p-0.5 shadow-lg transition-all ${
                      isInvited
                        ? 'bg-emerald-500 ring-2 ring-emerald-400'
                        : 'bg-gradient-to-tr from-amber-500 to-amber-300 ring-2 ring-white/80 group-hover:ring-amber-400'
                    }`}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>

                    {/* Verified check badge */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center border border-white text-[9px] font-extrabold">
                      ✓
                    </div>
                  </div>

                  {/* Name & Dynamic Distance Tag */}
                  <div className="mt-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[9px] font-bold text-cream flex items-center gap-1 whitespace-nowrap">
                    <span>{member.name.split(' ')[0]}</span>
                    <span className="text-amber-400 font-extrabold">· {liveDist}km</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="absolute bottom-5 z-20 px-4 py-2 bg-stone-900/90 border border-amber-500/30 rounded-2xl text-center backdrop-blur-sm max-w-xs animate-fade-in shadow-lg">
              <p className="text-[11px] font-bold text-amber-300">
                🧭 Squad Radar is Scanning in {selectedCity}
              </p>
              <p className="text-[9.5px] text-stone-400 mt-0.5 leading-tight">
                As nearby verified members open the app, they will appear on your distance rings.
              </p>
            </div>
          )}
        </div>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#FDFBF7] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-700" /> Verified Candidate
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
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
              <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-4">
                <img
                  src={activeCandidate.avatar}
                  alt={activeCandidate.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-200 shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-espresso truncate">{activeCandidate.name}</h2>
                    <span className="text-xs font-bold text-stone-400">({activeCandidate.age})</span>
                  </div>

                  <div className="text-xs font-semibold text-stone-700 flex items-center gap-1 mt-0.5">
                    <Briefcase size={12} className="text-amber-600 flex-shrink-0" />
                    <span>{activeCandidate.role} @ <strong>{activeCandidate.company}</strong></span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-stone-500">
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      <CheckCircle2 size={11} /> Work Email & ID Verified
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-700">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      <span>{activeCandidate.karmaScore} ({activeCandidate.meetupsAttended} meetups)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Weekend Goals */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
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

              {/* Recruitment / Invite to Crew Box */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl space-y-3">
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
                        setShowCreateModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-espresso text-xs font-extrabold transition-colors inline-flex items-center gap-1"
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
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:border-amber-600 text-espresso shadow-xs"
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
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-espresso font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
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

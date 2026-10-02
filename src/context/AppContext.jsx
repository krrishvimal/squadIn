import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CURRENT_USER, OTHER_USERS, INITIAL_PLANS } from '../userData';
import { calculateDistanceKm, INDIAN_CITIES, detectClosestCity, PASSION_TO_CATEGORY_MAP } from '../venueData';
import { NEARBY_RADAR_MEMBERS } from '../radarData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { IS_DESIGN_PREVIEW, PREVIEW_USER, PREVIEW_MEMBERS, PREVIEW_PLANS, appStorage } from '../designPreview';

const cloudEnabled = isSupabaseConfigured && !IS_DESIGN_PREVIEW;

const AppContext = createContext();

// Helper to convert database profile row to radar member
const mapProfileToRadarMember = (p) => {
  const primaryCat = (p.interests && p.interests.length > 0)
    ? (PASSION_TO_CATEGORY_MAP[p.interests[0]] || 'cafe')
    : 'cafe';
  const primaryActivity = (p.interests && p.interests.length > 0)
    ? p.interests[0]
    : '☕ Specialty Coffee';

  return {
    id: p.id,
    name: p.name || 'Verified Member',
    avatar: p.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    role: p.role || 'Member',
    company: p.company || 'SquadIn',
    city: p.city || 'Pune',
    gender: p.gender || 'unspecified',
    interests: p.interests || [primaryActivity],
    primaryActivity: primaryActivity,
    primaryCat: primaryCat,
    phoneVerified: Boolean(p.phone_verified),
    workEmailVerified: Boolean(p.work_email_verified),
    linkedin_verified: Boolean(p.linkedin_verified),
    idVerified: Boolean(p.id_verified || p.phone_verified),
    karmaScore: p.karma_score || 5.0,
    distanceKm: 1.8,
    latOffset: (Math.random() * 0.03 - 0.015),
    lngOffset: (Math.random() * 0.03 - 0.015)
  };
};

// Force wipe any old browser localStorage cache immediately on script execution
try {
  const version = appStorage.getItem('squadin_data_version');
  if (version !== 'clean_v3') {
    appStorage.removeItem('squadin_plans');
    appStorage.removeItem('squadin_current_user');
    appStorage.removeItem('squadin_onboarded');
    appStorage.removeItem('squadin_blocked_users');
    appStorage.setItem('squadin_data_version', 'clean_v3');
  }
} catch (e) {
  // ignore
}

// Convert database row to frontend plan object
const mapRowToPlan = (row, messages = [], requests = []) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  categoryLabel: row.category_label,
  hostId: row.host_id,
  city: row.city,
  venueName: row.venue_name,
  venueLat: row.venue_lat,
  venueLng: row.venue_lng,
  neighborhood: row.neighborhood,
  dateText: row.date_text,
  targetCapacity: row.target_capacity,
  status: row.status,
  womenOnly: row.women_only,
  isVerifiedVenue: row.is_verified_venue,
  venueType: row.venue_type,
  description: row.description,
  acceptedMembers: row.accepted_members || [],
  pendingRequests: requests,
  messages: messages
});

// Convert frontend plan object to database row
const mapPlanToRow = (plan) => ({
  id: plan.id,
  title: plan.title,
  category: plan.category,
  category_label: plan.categoryLabel,
  host_id: plan.hostId,
  city: plan.city,
  venue_name: plan.venueName,
  venue_lat: plan.venueLat,
  venue_lng: plan.venueLng,
  neighborhood: plan.neighborhood,
  date_text: plan.dateText,
  target_capacity: plan.targetCapacity,
  status: plan.status,
  women_only: plan.womenOnly,
  is_verified_venue: plan.isVerifiedVenue,
  venue_type: plan.venueType,
  description: plan.description,
  accepted_members: plan.acceptedMembers
});

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

const getOrCreateUserId = () => {
  try {
    let id = appStorage.getItem('squadin_user_id');
    if (!id || id === 'usr_guest') {
      id = 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36).slice(-4);
      appStorage.setItem('squadin_user_id', id);
    }
    return id;
  } catch {
    return 'usr_' + Math.random().toString(36).substring(2, 9);
  }
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (IS_DESIGN_PREVIEW) {
      try { return JSON.parse(appStorage.getItem('squadin_current_user')) || PREVIEW_USER; }
      catch { return PREVIEW_USER; }
    }
    try {
      const saved = appStorage.getItem('squadin_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.id !== 'usr_guest') {
          return parsed;
        }
      }
    } catch {}
    const newId = getOrCreateUserId();
    const hash = newId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const chosenAvatar = DEFAULT_AVATARS[hash % DEFAULT_AVATARS.length];
    const initialCity = appStorage.getItem('squadin_selected_city') || INDIAN_CITIES[0].name;
    const newUser = {
      ...CURRENT_USER,
      id: newId,
      name: CURRENT_USER.name || 'Verified Member',
      avatar: chosenAvatar,
      city: initialCity,
      interests: ['☕ Specialty Coffee', '🍕 Food Walks']
    };
    try {
      appStorage.setItem('squadin_current_user', JSON.stringify(newUser));
    } catch {}
    return newUser;
  });

  const [allUsers, setAllUsers] = useState(() => {
    return [currentUser, ...(IS_DESIGN_PREVIEW ? PREVIEW_MEMBERS : OTHER_USERS)];
  });

  // Strict: 100% clean plans array
  const [plans, setPlans] = useState(() => {
    try {
      const saved = appStorage.getItem('squadin_plans');
      return saved ? JSON.parse(saved) : (IS_DESIGN_PREVIEW ? PREVIEW_PLANS : []);
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'radar', 'my_crews', 'chats', 'profile'
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState(null);
  const [activeChatPlanId, setActiveChatPlanId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [karmaReviewPlan, setKarmaReviewPlan] = useState(null);
  const [selectedCity, setSelectedCityState] = useState(() => {
    try {
      return appStorage.getItem('squadin_selected_city') || (IS_DESIGN_PREVIEW ? 'Bengaluru' : 'Pune');
    } catch {
      return 'Pune';
    }
  });

  // User's Live GPS Coordinates (initialized to selected city center)
  const [userCoords, setUserCoords] = useState(() => {
    try {
      const savedCity = appStorage.getItem('squadin_selected_city') || (IS_DESIGN_PREVIEW ? 'Bengaluru' : 'Pune');
      const cityObj = INDIAN_CITIES.find(c => c.name.toLowerCase() === savedCity.toLowerCase());
      if (cityObj) {
        return { lat: cityObj.lat, lng: cityObj.lng, isRealGPS: false };
      }
    } catch {}
    return { lat: 18.5204, lng: 73.8567, isRealGPS: false };
  });
  const [isLocating, setIsLocating] = useState(false);

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    try {
      appStorage.setItem('squadin_selected_city', city);
    } catch (e) {}

    // Update userCoords to match selected city center when GPS is not currently active
    const cityObj = INDIAN_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
    if (cityObj) {
      setUserCoords(prev => {
        if (!prev.isRealGPS) {
          return { lat: cityObj.lat, lng: cityObj.lng, isRealGPS: false };
        }
        return prev;
      });
    }

    // Update current user profile city and sync
    if (currentUser?.id) {
      const updatedUser = { ...currentUser, city };
      setCurrentUser(updatedUser);
      try {
        appStorage.setItem('squadin_current_user', JSON.stringify(updatedUser));
      } catch (e) {}
      if (cloudEnabled && supabase) {
        try {
          supabase.from('profiles').upsert({
            id: currentUser.id,
            name: currentUser.name || 'Verified Member',
            avatar: currentUser.avatar,
            city: city
          }, { onConflict: 'id' }).then(() => {}, () => {});
        } catch (e) {}
      }
    }
  };

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showPwaInstall, setShowPwaInstall] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(cloudEnabled);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [reportingUser, setReportingUser] = useState(null); // { user, planId }
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 5000);
  };
  const [showOnboardingModal, setShowOnboardingModal] = useState(() => {
    // Auto-show on first visit, but not if already onboarded or previously skipped
    return appStorage.getItem('squadin_onboarded') !== 'true' && appStorage.getItem('squadin_skip_initial') !== 'true';
  });
  const [onboardingReason, setOnboardingReason] = useState('general'); // 'join_plan' | 'create_plan' | 'radar_invite' | 'general'
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState(null);

  // Verification gate: only requires a real name + completed onboarding
  // Phone/Selfie/LinkedIn are optional trust badges that boost visibility, not gates
  const isUserVerified = Boolean(
    currentUser?.name &&
    currentUser?.name.trim() !== '' &&
    currentUser?.name !== 'Verified Member' &&
    appStorage.getItem('squadin_onboarded') === 'true'
  );

  // High-intent action gatekeeper: allows action if verified, otherwise prompts 30-sec verification modal
  const requireVerification = (actionCallback, reason = 'general') => {
    if (isUserVerified) {
      if (typeof actionCallback === 'function') actionCallback();
      return true;
    }
    setPendingActionAfterAuth(() => actionCallback);
    setOnboardingReason(reason);
    setShowOnboardingModal(true);
    return false;
  };
  const [blockedUserIds, setBlockedUserIds] = useState(() => {
    try {
      const saved = appStorage.getItem('squadin_blocked_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Radar State
  const [radarMembers, setRadarMembers] = useState(IS_DESIGN_PREVIEW ? PREVIEW_MEMBERS : NEARBY_RADAR_MEMBERS);
  const [isRadarBroadcastOn, setIsRadarBroadcastOn] = useState(true);
  const [invitedUserIds, setInvitedUserIds] = useState([]);
  const [selectedRadarUser, setSelectedRadarUser] = useState(null);

  // Wave feature state - for lightweight "interested" signals on Radar
  const [waves, setWaves] = useState(() => {
    try { return JSON.parse(appStorage.getItem('squadin_waves') || (IS_DESIGN_PREVIEW ? '[{"fromUserId":"preview_arjun","toUserId":"preview_krrish"}]' : '[]')); } catch { return []; }
  });

  // Persist waves to localStorage
  useEffect(() => {
    appStorage.setItem('squadin_waves', JSON.stringify(waves));
  }, [waves]);

  const normId = (id) => (id !== null && id !== undefined) ? String(id).trim().toLowerCase() : '';

  // Send a wave to another user
  const sendWave = (toUserId) => {
    if (!toUserId || !currentUser?.id || normId(toUserId) === normId(currentUser.id)) return;
    const newWave = {
      fromUserId: String(currentUser.id),
      toUserId: String(toUserId),
      timestamp: new Date().toISOString()
    };
    setWaves(prev => {
      // Don't duplicate waves to the same user
      if (prev.some(w => normId(w.fromUserId) === normId(currentUser.id) && normId(w.toUserId) === normId(toUserId))) return prev;
      return [...prev, newWave];
    });
    
    // Also try to sync wave to Supabase for cross-device visibility
    if (cloudEnabled && supabase) {
      try {
        supabase.from('messages').insert({
          plan_id: 'waves',
          user_id: String(currentUser.id),
          user_name: currentUser.name,
          user_avatar: currentUser.avatar,
          text: `👋 Wave to ${toUserId}`,
          type: 'wave',
          target_user_id: String(toUserId)
        }).then(() => {}, () => {});
      } catch (e) {}
    }
    
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  // Check if current user has waved at a specific user
  const hasWavedAt = (userId) => {
    if (!userId || !currentUser?.id) return false;
    const cId = normId(currentUser.id);
    const targetId = normId(userId);
    return waves.some(w => normId(w.fromUserId) === cId && normId(w.toUserId) === targetId);
  };

  // Check if another user has waved at current user (from cloud messages)
  const hasReceivedWaveFrom = (userId) => {
    if (!userId || !currentUser?.id) return false;
    const cId = normId(currentUser.id);
    const senderId = normId(userId);
    return waves.some(w => normId(w.fromUserId) === senderId && normId(w.toUserId) === cId);
  };

  // Check for mutual wave (both waved at each other)
  const isMutualWave = (userId) => {
    if (!userId || !currentUser?.id) return false;
    return hasWavedAt(userId) && hasReceivedWaveFrom(userId);
  };

  // Helper for IP-based geolocation fallback (Swiggy / Google Maps standard)
  const fallbackToIpLocation = (safetyTimer, resolve) => {
    fetch('https://ipapi.co/json/')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (safetyTimer) clearTimeout(safetyTimer);
        setIsLocating(false);
        if (data && (data.latitude || data.city)) {
          if (data.latitude && data.longitude) {
            setUserCoords({
              lat: data.latitude,
              lng: data.longitude,
              isRealGPS: false
            });
            const closest = detectClosestCity(data.latitude, data.longitude);
            if (closest) {
              setSelectedCity(closest);
              resolve({ lat: data.latitude, lng: data.longitude, city: closest });
              return;
            }
          }
          if (data.city) {
            const lower = data.city.toLowerCase();
            const match = INDIAN_CITIES.find(c => 
              c.name.toLowerCase() === lower || 
              c.aliases.some(a => lower.includes(a))
            );
            if (match) {
              setSelectedCity(match.name);
              resolve({ city: match.name });
              return;
            }
          }
        }
        resolve({ city: selectedCity });
      })
      .catch(() => {
        if (safetyTimer) clearTimeout(safetyTimer);
        setIsLocating(false);
        resolve({ city: selectedCity });
      });
  };

  // Hybrid Location Engine (Google Maps / Swiggy production standard)
  const requestLiveLocation = () => {
    return new Promise((resolve) => {
      setIsLocating(true);

      // Safety fallback timer (12 seconds)
      const safetyTimer = setTimeout(() => {
        fallbackToIpLocation(null, resolve);
      }, 12000);

      if (!navigator.geolocation) {
        fallbackToIpLocation(safetyTimer, resolve);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (safetyTimer) clearTimeout(safetyTimer);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({
            lat,
            lng,
            isRealGPS: true
          });

          // 1. Instantly detect nearest Indian city center based on distance
          const closest = detectClosestCity(lat, lng);
          if (closest) {
            setSelectedCity(closest);
          }

          setIsLocating(false);
          resolve({ lat, lng, city: closest });

          // 2. Non-blocking background reverse geocoding for fine city detection
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data && data.address) {
                const address = data.address;
                const detectedName = address.city || address.town || address.state_district || address.county || address.state || '';
                if (detectedName) {
                  const lower = detectedName.toLowerCase();
                  const match = INDIAN_CITIES.find(c => 
                    c.name.toLowerCase() === lower || 
                    c.aliases.some(a => lower.includes(a))
                  );
                  if (match) {
                    setSelectedCity(match.name);
                  }
                }
              }
            })
            .catch(() => {});
        },
        (err) => {
          console.warn('GPS notice (falling back to IP location):', err);
          fallbackToIpLocation(safetyTimer, resolve);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  // Save to LocalStorage
  useEffect(() => {
    appStorage.setItem('squadin_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    appStorage.setItem('squadin_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // SUPABASE REALTIME & DATABASE SYNC ENGINE
  useEffect(() => {
    if (!cloudEnabled || !supabase) return;

    // 1. Fetch initial profiles, plans, messages, and join requests from Supabase
    const initCloudData = async () => {
      try {
        // Only sync profile to cloud if user has completed onboarding (has a real name)
        // This prevents ghost "Verified Member" entries from polluting the database
        if (currentUser?.id && currentUser?.name && currentUser.name !== 'Verified Member' && appStorage.getItem('squadin_onboarded') === 'true') {
          // Try full payload first, then progressively smaller if schema doesn't match
          const fullPayload = {
            id: currentUser.id,
            name: currentUser.name || 'Verified Member',
            avatar: currentUser.avatar,
            bio: currentUser.bio || 'Excited to meet new people and explore weekend activities!',
            city: currentUser.city || selectedCity,
            role: currentUser.role || 'Member',
            company: currentUser.company || 'SquadIn'
          };

          let profileSynced = false;
          try {
            const { error } = await supabase.from('profiles').upsert(fullPayload, { onConflict: 'id' });
            if (!error) {
              profileSynced = true;
              console.info('✅ Profile synced to cloud (full payload)');
            } else {
              console.warn('⚠️ Full profile upsert failed:', error.message);
              // Try minimal payload
              const minPayload = { id: currentUser.id, name: currentUser.name || 'Verified Member' };
              const { error: minError } = await supabase.from('profiles').upsert(minPayload, { onConflict: 'id' });
              if (!minError) {
                profileSynced = true;
                console.info('✅ Profile synced to cloud (minimal payload)');
              } else {
                console.warn('⚠️ Minimal profile upsert also failed:', minError.message, '— Radar will use plans-based discovery.');
              }
            }
          } catch (e) {
            console.warn('⚠️ Profile sync exception:', e);
          }
        }

        // Fetch profiles for allUsers and Radar
        let hasCloudProfiles = false;
        try {
          const { data: cloudProfiles, error: profilesError } = await supabase.from('profiles').select('*');
          if (!profilesError && cloudProfiles && cloudProfiles.length > 0) {
            hasCloudProfiles = true;
            console.info(`✅ Fetched ${cloudProfiles.length} cloud profiles`);

            const userProfiles = cloudProfiles.map(p => ({
              id: p.id,
              name: p.name || 'Verified Member',
              avatar: p.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
              role: p.role || 'Member',
              company: p.company || 'SquadIn',
              city: p.city || selectedCity,
              interests: p.interests || [],
              phoneVerified: Boolean(p.phone_verified),
              workEmailVerified: Boolean(p.work_email_verified),
              linkedin_verified: Boolean(p.linkedin_verified),
              idVerified: Boolean(p.id_verified || p.phone_verified),
              karmaScore: p.karma_score || 5.0
            }));

            setAllUsers(prev => {
              const map = new Map();
              [...prev, ...userProfiles].forEach(u => map.set(u.id, u));
              return Array.from(map.values());
            });

            // Set radar members for other users
            const radarCandidates = cloudProfiles
              .filter(p => p.id !== currentUser.id)
              .map(p => mapProfileToRadarMember(p));

            if (radarCandidates.length > 0) {
              setRadarMembers(radarCandidates);
              console.info(`✅ Radar populated with ${radarCandidates.length} members from profiles`);
            }
          } else {
            if (profilesError) console.warn('⚠️ Profiles fetch error:', profilesError.message);
          }
        } catch (e) {
          console.warn('⚠️ Profiles fetch exception:', e);
        }

        // Fetch plans
        const { data: cloudPlans, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: false });

        if (!plansError && cloudPlans) {
          const { data: cloudMessages } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });

          // After fetching cloud messages, extract waves
          if (cloudMessages) {
            const waveMessages = cloudMessages.filter(m => m.plan_id === 'waves' || m.type === 'wave');
            if (waveMessages.length > 0) {
              setWaves(prev => {
                const existing = new Set(prev.map(w => `${w.fromUserId}-${w.toUserId}`));
                const newWaves = waveMessages
                  .map(m => {
                    const targetId = m.target_user_id || (m.text && m.text.includes('Wave to ') ? m.text.split('Wave to ')[1]?.trim() : null);
                    if (!m.user_id || !targetId) return null;
                    return {
                      fromUserId: m.user_id,
                      toUserId: targetId,
                      timestamp: m.created_at || new Date().toISOString()
                    };
                  })
                  .filter(Boolean)
                  .filter(w => !existing.has(`${w.fromUserId}-${w.toUserId}`));
                return [...prev, ...newWaves];
              });
            }
          }

          // Fetch join requests
          let cloudRequests = [];
          try {
            const { data: reqs } = await supabase.from('plan_requests').select('*');
            if (reqs) cloudRequests = reqs;
          } catch (e) {}

          const formattedPlans = cloudPlans.map(cp => {
            const planMsgs = (cloudMessages || [])
              .filter(m => m.plan_id === cp.id)
              .map(m => ({
                id: m.id,
                senderId: m.sender_id,
                content: m.content,
                timestamp: m.timestamp,
                isSystem: m.is_system
              }));

            const planReqs = cloudRequests
              .filter(r => r.plan_id === cp.id && r.status !== 'ACCEPTED')
              .map(r => ({
                userId: r.user_id,
                userName: r.user_name || 'Member',
                userAvatar: r.user_avatar,
                message: r.message,
                requestedAt: 'Just now'
              }));

            return mapRowToPlan(cp, planMsgs, planReqs);
          });

          if (formattedPlans.length > 0) {
            setPlans(formattedPlans);
          }

          // ALWAYS populate radar members from ALL plan participants (hosts + members)
          // This is the reliable fallback when profiles table doesn't work
          const planUserIds = new Set();
          const planCandidates = [];

          cloudPlans.forEach(cp => {
            // Extract host
            if (cp.host_id && cp.host_id !== currentUser.id && !planUserIds.has(cp.host_id)) {
              planUserIds.add(cp.host_id);
              const matchedProfile = (cloudProfiles || []).find(p => p.id === cp.host_id);
              const hostName = (matchedProfile && matchedProfile.name && matchedProfile.name !== 'Verified Member')
                ? matchedProfile.name
                : (cp.host_name && cp.host_name !== 'Verified Member' ? cp.host_name : 'Verified Host');
              const hostAvatar = (matchedProfile && matchedProfile.avatar)
                ? matchedProfile.avatar
                : (cp.host_avatar || DEFAULT_AVATARS[Math.abs(cp.host_id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % DEFAULT_AVATARS.length]);

              planCandidates.push({
                id: cp.host_id,
                name: hostName,
                avatar: hostAvatar,
                role: matchedProfile?.role || 'Meetup Host',
                company: matchedProfile?.company || cp.neighborhood || cp.city || 'SquadIn',
                city: cp.city || selectedCity,
                interests: [cp.category_label || '☕ Hangout'],
                primaryActivity: cp.category_label || '☕ Hangout',
                primaryCat: cp.category || 'cafe',
                phoneVerified: true,
                idVerified: true,
                karmaScore: matchedProfile?.karma_score || 5.0,
                distanceKm: 2.3,
                latOffset: (Math.random() * 0.02 - 0.01),
                lngOffset: (Math.random() * 0.02 - 0.01)
              });
            }

            // Extract accepted members
            const members = cp.accepted_members || [];
            members.forEach(memberId => {
              if (memberId && memberId !== currentUser.id && memberId !== cp.host_id && !planUserIds.has(memberId)) {
                planUserIds.add(memberId);
                const matchedProfile = (cloudProfiles || []).find(p => p.id === memberId);
                const memberName = (matchedProfile && matchedProfile.name && matchedProfile.name !== 'Verified Member')
                  ? matchedProfile.name
                  : 'Verified Member';
                const memberAvatar = (matchedProfile && matchedProfile.avatar)
                  ? matchedProfile.avatar
                  : DEFAULT_AVATARS[Math.abs(memberId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % DEFAULT_AVATARS.length];

                planCandidates.push({
                  id: memberId,
                  name: memberName,
                  avatar: memberAvatar,
                  role: matchedProfile?.role || 'Weekend Explorer',
                  company: matchedProfile?.company || cp.city || 'SquadIn',
                  city: cp.city || selectedCity,
                  interests: [cp.category_label || '☕ Hangout'],
                  primaryActivity: cp.category_label || '☕ Hangout',
                  primaryCat: cp.category || 'cafe',
                  phoneVerified: true,
                  idVerified: true,
                  karmaScore: matchedProfile?.karma_score || 5.0,
                  distanceKm: 3.5,
                  latOffset: (Math.random() * 0.03 - 0.015),
                  lngOffset: (Math.random() * 0.03 - 0.015)
                });
              }
            });
          });

          if (planCandidates.length > 0) {
            setRadarMembers(prev => {
              const map = new Map();
              [...prev, ...planCandidates].forEach(m => map.set(m.id, m));
              return Array.from(map.values());
            });
            console.info(`✅ Radar populated with ${planCandidates.length} members from plans`);
          }
        }
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    };

    initCloudData();

    // 2. Realtime WebSocket subscriptions for Plans, Messages, Profiles, and Requests
    const plansSubscription = supabase
      .channel('public:plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newPlan = mapRowToPlan(payload.new, [], []);
          setPlans(prev => [newPlan, ...prev.filter(p => p.id !== newPlan.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setPlans(prev => prev.map(p => {
            if (p.id === payload.new.id) {
              return {
                ...p,
                ...mapRowToPlan(payload.new, p.messages, p.pendingRequests)
              };
            }
            return p;
          }));
        } else if (payload.eventType === 'DELETE') {
          setPlans(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new?.plan_id === 'waves' || payload.new?.type === 'wave') {
          const targetId = payload.new.target_user_id || (payload.new.text && payload.new.text.includes('Wave to ') ? payload.new.text.split('Wave to ')[1]?.trim() : null);
          if (!payload.new.user_id || !targetId) return;

          const incomingWave = {
            fromUserId: payload.new.user_id,
            toUserId: targetId,
            timestamp: payload.new.created_at || new Date().toISOString()
          };
          setWaves(prev => {
            if (prev.some(w => w.fromUserId === incomingWave.fromUserId && w.toUserId === incomingWave.toUserId)) return prev;
            return [...prev, incomingWave];
          });

          // If this wave is sent to current user & forms a mutual connection -> trigger squad-up celebration!
          if (incomingWave.toUserId === currentUser?.id) {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          }
          return;
        }

        const newMsg = {
          id: payload.new.id,
          senderId: payload.new.sender_id,
          content: payload.new.content,
          timestamp: payload.new.timestamp,
          isSystem: payload.new.is_system
        };

        setPlans(prev => prev.map(p => {
          if (p.id === payload.new.plan_id) {
            const exists = p.messages.some(m => m.id === newMsg.id);
            if (exists) return p;
            return {
              ...p,
              messages: [...p.messages, newMsg]
            };
          }
          return p;
        }));
      })
      .subscribe();

    const profilesSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.new) {
          const updatedProfile = payload.new;
          if (updatedProfile.id !== currentUser.id) {
            const radarCandidate = mapProfileToRadarMember(updatedProfile);
            setRadarMembers(prev => [radarCandidate, ...prev.filter(m => m.id !== radarCandidate.id)]);
            setAllUsers(prev => [{
              id: updatedProfile.id,
              name: updatedProfile.name,
              avatar: updatedProfile.avatar,
              role: updatedProfile.role,
              company: updatedProfile.company,
              city: updatedProfile.city,
              interests: updatedProfile.interests || []
            }, ...prev.filter(u => u.id !== updatedProfile.id)]);
          }
        }
      })
      .subscribe();

    const requestsSubscription = supabase
      .channel('public:plan_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const req = payload.new;
          setPlans(prev => prev.map(p => {
            if (p.id === req.plan_id) {
              const exists = p.pendingRequests.some(r => r.userId === req.user_id);
              if (exists) return p;

              // Trigger toast notification if current user is the host of this plan
              if (p.hostId === currentUser?.id) {
                showToast(`🎉 ${req.user_name || 'A member'} requested to join your meetup: "${p.title}"!`);
              }

              return {
                ...p,
                pendingRequests: [
                  ...p.pendingRequests,
                  {
                    userId: req.user_id,
                    userName: req.user_name || 'Member',
                    userAvatar: req.user_avatar,
                    message: req.message,
                    requestedAt: 'Just now'
                  }
                ]
              };
            }
            return p;
          }));
        } else if (payload.eventType === 'DELETE' || payload.eventType === 'UPDATE') {
          const req = payload.old || payload.new;
          if (req?.plan_id && req?.user_id) {
            setPlans(prev => prev.map(p => {
              if (p.id === req.plan_id) {
                return {
                  ...p,
                  pendingRequests: p.pendingRequests.filter(r => r.userId !== req.user_id)
                };
              }
              return p;
            }));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(plansSubscription);
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(requestsSubscription);
    };
  }, []);

  // Update profile
  const updateCurrentUserProfile = async (updates) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers(users => users.map(u => u.id === currentUser.id ? updated : u));
    appStorage.setItem('squadin_current_user', JSON.stringify(updated));

    // If there was a pending high-intent action waiting for verification, execute it now
    if (pendingActionAfterAuth && typeof pendingActionAfterAuth === 'function') {
      setTimeout(() => {
        pendingActionAfterAuth();
        setPendingActionAfterAuth(null);
      }, 300);
    }

    if (cloudEnabled && supabase) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: updated.id,
          name: updated.name,
          avatar: updated.avatar,
          bio: updated.bio,
          city: updated.city || selectedCity,
          role: updated.role,
          company: updated.company
        }, { onConflict: 'id' });
        if (error) {
          console.warn('⚠️ Profile update upsert failed:', error.message);
          // Try minimal
          const { error: minErr } = await supabase.from('profiles').upsert({
            id: updated.id,
            name: updated.name
          }, { onConflict: 'id' });
          if (minErr) console.warn('⚠️ Minimal profile update also failed:', minErr.message);
          else console.info('✅ Profile updated (minimal payload)');
        } else {
          console.info('✅ Profile updated in cloud');
        }
      } catch (e) {
        console.warn('⚠️ Profile update exception:', e);
      }
    }
  };

  // Helper to find user by ID
  const getUserById = (userId) => {
    return allUsers.find(u => u.id === userId) || {
      id: userId,
      name: currentUser.id === userId ? currentUser.name : 'Verified Member',
      avatar: currentUser.id === userId ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      company: currentUser.id === userId ? currentUser.company : 'Member',
      workEmailVerified: true,
      idVerified: true,
      karmaScore: 5.0
    };
  };

  // 1. Create a Plan (Host custom capacity)
  const createPlan = async (planData) => {
    const newPlan = {
      id: `plan_${Date.now()}`,
      title: planData.title,
      category: planData.category || 'cafe',
      categoryLabel: planData.categoryLabel || 'Hangout',
      hostId: currentUser.id,
      city: planData.city || selectedCity,
      venueName: planData.venueName,
      venueLat: planData.venueLat ?? userCoords.lat,
      venueLng: planData.venueLng ?? userCoords.lng,
      neighborhood: planData.neighborhood || `${selectedCity}`,
      dateText: planData.dateText,
      targetCapacity: parseInt(planData.targetCapacity, 10) || 4,
      status: 'OPEN',
      womenOnly: Boolean(planData.womenOnly),
      isVerifiedVenue: false,
      venueType: planData.venueType || 'Public Meetup Spot',
      description: planData.description,
      acceptedMembers: [currentUser.id],
      pendingRequests: [],
      messages: []
    };

    // Optimistic local update
    setPlans(prev => [newPlan, ...prev]);
    setShowCreateModal(false);
    setActiveTab('my_crews');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Cloud Database Persistence
    if (cloudEnabled && supabase) {
      try {
        await supabase.from('plans').upsert(mapPlanToRow(newPlan), { onConflict: 'id' });
      } catch (err) {
        // Safe local fallback
      }
    }
  };

  // 2. Request to Join Plan
  const requestToJoinPlan = async (planId, userMessage = 'Hey! Would love to join your crew.') => {
    const existingRequest = plans.find(p => p.id === planId)?.pendingRequests?.some(r => r.userId === currentUser.id);
    if (existingRequest) {
      if (!userMessage.trim()) return;
      setPlans(prev => prev.map(p => p.id !== planId ? p : {
        ...p, pendingRequests: p.pendingRequests.map(r => r.userId === currentUser.id ? { ...r, message: userMessage } : r)
      }));
      if (cloudEnabled && supabase) {
        await supabase.from('plan_requests').update({ message: userMessage }).eq('plan_id', planId).eq('user_id', currentUser.id);
      }
      return;
    }
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      if (p.acceptedMembers.includes(currentUser.id)) return p;
      if (p.pendingRequests.some(r => r.userId === currentUser.id)) return p;

      return {
        ...p,
        pendingRequests: [
          ...p.pendingRequests,
          {
            userId: currentUser.id,
            userName: currentUser.name || 'Member',
            userAvatar: currentUser.avatar,
            requestedAt: 'Just now',
            message: userMessage
          }
        ]
      };
    }));

    if (cloudEnabled && supabase) {
      try {
        await supabase.from('plan_requests').insert({
          plan_id: planId,
          user_id: currentUser.id,
          user_name: currentUser.name || 'Member',
          user_avatar: currentUser.avatar,
          message: userMessage,
          status: 'PENDING'
        });
      } catch (err) {
        console.warn('Request cloud sync notice:', err);
      }
    }
  };

  // 3. Host Accepts Request
  const acceptJoinRequest = async (planId, userId) => {
    // Prevent over-filling the crew
    const plan = plans.find(p => p.id === planId);
    if (plan && plan.acceptedMembers && plan.acceptedMembers.length >= plan.targetCapacity) {
      console.warn('Cannot accept: crew is already full');
      return;
    }

    let updatedPlanTarget = null;

    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;

      const newAccepted = [...p.acceptedMembers, userId];
      const newPending = p.pendingRequests.filter(r => r.userId !== userId);
      const isNowFull = newAccepted.length >= p.targetCapacity;

      const updatedMessages = isNowFull && p.status !== 'LOCKED_CHAT_ACTIVE' ? [
        ...p.messages,
        {
          id: `msg_sys_${Date.now()}`,
          senderId: 'SYSTEM',
          content: `🎉 The crew is officially full (${newAccepted.length}/${p.targetCapacity})! Chat is unlocked. Say hi to everyone!`,
          timestamp: 'Just now',
          isSystem: true
        }
      ] : p.messages;

      if (isNowFull) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      const updated = {
        ...p,
        acceptedMembers: newAccepted,
        pendingRequests: newPending,
        status: isNowFull ? 'LOCKED_CHAT_ACTIVE' : p.status,
        messages: updatedMessages
      };

      updatedPlanTarget = updated;
      return updated;
    }));

    if (cloudEnabled && supabase && updatedPlanTarget) {
      try {
        await supabase
          .from('plans')
          .update({
            accepted_members: updatedPlanTarget.acceptedMembers,
            status: updatedPlanTarget.status
          })
          .eq('id', planId);

        await supabase
          .from('plan_requests')
          .delete()
          .eq('plan_id', planId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Accept request cloud sync notice:', err);
      }
    }
  };

  // 4. Host Rejects Request
  const rejectJoinRequest = async (planId, userId) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        pendingRequests: p.pendingRequests.filter(r => r.userId !== userId)
      };
    }));

    if (cloudEnabled && supabase) {
      try {
        await supabase
          .from('plan_requests')
          .delete()
          .eq('plan_id', planId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Reject request cloud sync notice:', err);
      }
    }
  };

  // 5. Host Early Unlock
  const hostEarlyUnlockPlan = async (planId) => {
    let updatedPlanTarget = null;

    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const updated = {
        ...p,
        targetCapacity: p.acceptedMembers.length,
        status: 'LOCKED_CHAT_ACTIVE',
        messages: [
          ...p.messages,
          {
            id: `msg_sys_${Date.now()}`,
            senderId: 'SYSTEM',
            content: `⚡ Host locked the crew early with ${p.acceptedMembers.length} members! Group chat is unlocked. Coordinate arrival!`,
            timestamp: 'Just now',
            isSystem: true
          }
        ]
      };
      updatedPlanTarget = updated;
      return updated;
    }));

    if (cloudEnabled && supabase && updatedPlanTarget) {
      try {
        await supabase
          .from('plans')
          .update({
            target_capacity: updatedPlanTarget.targetCapacity,
            status: 'LOCKED_CHAT_ACTIVE'
          })
          .eq('id', planId);
      } catch (err) {
        console.warn('Host early unlock cloud sync notice:', err);
      }
    }
  };

  // 6. Host Expands Capacity (+1 free)
  const hostUpdateCapacity = async (planId, delta) => {
    let updatedTarget = null;

    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const newCap = Math.max(p.acceptedMembers.length, p.targetCapacity + delta);
      const updated = {
        ...p,
        targetCapacity: newCap,
        status: p.acceptedMembers.length >= newCap ? 'LOCKED_CHAT_ACTIVE' : 'OPEN'
      };
      updatedTarget = updated;
      return updated;
    }));

    if (cloudEnabled && supabase && updatedTarget) {
      try {
        await supabase
          .from('plans')
          .update({
            target_capacity: updatedTarget.targetCapacity,
            status: updatedTarget.status
          })
          .eq('id', planId);
      } catch (err) {
        console.warn('Update capacity cloud sync notice:', err);
      }
    }
  };

  // 7. Send Chat Message
  const sendMessage = async (planId, content) => {
    if (!content.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        messages: [...p.messages, newMsg]
      };
    }));

    if (cloudEnabled && supabase) {
      try {
        await supabase.from('messages').insert({
          id: newMsg.id,
          plan_id: planId,
          sender_id: currentUser.id,
          content: newMsg.content,
          timestamp: newMsg.timestamp,
          is_system: false
        });
      } catch (err) {
        console.warn('Message cloud sync notice:', err);
      }
    }
  };

  // 8. Trigger Emergency SOS
  const triggerEmergencySOS = (plan) => {
    return new Promise((resolve) => {
      const attendeeNames = plan.acceptedMembers
        .map(id => getUserById(id).name)
        .join(', ');

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(5);
            const lng = pos.coords.longitude.toFixed(5);
            const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
            
            const sosMessage = `🚨 [SquadIn Live SOS Alert]\nI am currently with my meetup crew for: "${plan.title}".\n📍 Venue: ${plan.venueName}, ${plan.neighborhood}\n🗺️ My Live GPS Pin: ${mapsLink}\n👥 Crew Members: ${attendeeNames}\n⏰ Time: ${new Date().toLocaleTimeString()} (${new Date().toLocaleDateString()})`;
            resolve(sosMessage);
          },
          () => {
            const mapsLink = plan.venueLat ? `https://maps.google.com/?q=${plan.venueLat},${plan.venueLng}` : '';
            const sosMessage = `🚨 [SquadIn Live SOS Alert]\nI am currently with my meetup crew for: "${plan.title}".\n📍 Venue: ${plan.venueName}, ${plan.neighborhood}\n🗺️ Venue Map: ${mapsLink}\n👥 Crew Members: ${attendeeNames}\n⏰ Time: ${new Date().toLocaleTimeString()}`;
            resolve(sosMessage);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        const sosMessage = `🚨 [SquadIn Live SOS Alert]\nI am currently with my meetup crew for: "${plan.title}".\n📍 Venue: ${plan.venueName}, ${plan.neighborhood}\n👥 Crew Members: ${attendeeNames}\n⏰ Time: ${new Date().toLocaleTimeString()}`;
        resolve(sosMessage);
      }
    });
  };

  // 9. Plan Distance
  const getPlanDistance = (plan) => {
    if (!plan.venueLat || !plan.venueLng) return '1.2 km';
    const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, plan.venueLat, plan.venueLng);
    return dist ? `${dist} km` : '1.5 km';
  };

  // 10. Submit Karma Review
  const submitKarmaReview = (planId, userRatings) => {
    setAllUsers(prev => prev.map(u => {
      if (userRatings[u.id]) {
        return {
          ...u,
          karmaScore: Math.min(5.0, Number((u.karmaScore + 0.05).toFixed(1))),
          meetupsAttended: u.meetupsAttended + 1
        };
      }
      return u;
    }));

    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, status: 'COMPLETED' };
      }
      return p;
    }));

    setShowKarmaModal(false);
  };

  // 11. Send Crew Invite from Host to Nearby Radar Candidate
  const sendCrewInvite = (targetUserId, planId) => {
    if (!planId) return;

    setInvitedUserIds(prev => [...prev, targetUserId]);

    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      if (p.acceptedMembers.includes(targetUserId)) return p;

      const newAccepted = [...p.acceptedMembers, targetUserId];
      const isNowFull = newAccepted.length >= p.targetCapacity;

      return {
        ...p,
        acceptedMembers: newAccepted,
        status: isNowFull ? 'LOCKED_CHAT_ACTIVE' : p.status,
        messages: isNowFull && p.status !== 'LOCKED_CHAT_ACTIVE' ? [
          {
            id: `msg_unlock_${Date.now()}`,
            senderId: 'system',
            senderName: 'SquadIn Bot 🤖',
            content: `🎉 Crew is full! Group chat unlocked. Time to coordinate meeting up at ${p.venueName}!`,
            timestamp: 'Just now',
            isSystem: true
          }
        ] : p.messages
      };
    }));

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // 12. Safety Moderation: Block & Report
  const blockUser = (userId) => {
    setBlockedUserIds(prev => {
      if (prev.includes(userId)) return prev;
      const updated = [...prev, userId];
      try {
        appStorage.setItem('squadin_blocked_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const unblockUser = (userId) => {
    setBlockedUserIds(prev => {
      const updated = prev.filter(id => id !== userId);
      try {
        appStorage.setItem('squadin_blocked_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const reportUser = async (reportData) => {
    if (cloudEnabled && supabase) {
      try {
        await supabase.from('reports').insert({
          target_user_id: reportData.targetUserId,
          reporter_id: currentUser.id,
          plan_id: reportData.planId,
          reason: reportData.reason,
          details: reportData.details,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        // Table created on demand
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        plans,
        activeTab,
        setActiveTab,
        selectedPlanForDetail,
        setSelectedPlanForDetail,
        activeChatPlanId,
        setActiveChatPlanId,
        showCreateModal,
        setShowCreateModal,
        showKarmaModal,
        setShowKarmaModal,
        karmaReviewPlan,
        setKarmaReviewPlan,
        selectedCity,
        setSelectedCity,
        categoryFilter,
        setCategoryFilter,
        womenOnlyFilter,
        setWomenOnlyFilter,
        sortByDistance,
        setSortByDistance,
        userCoords,
        isLocating,
        requestLiveLocation,
        showPwaInstall,
        setShowPwaInstall,
        isCloudConnected,
        showGuidelinesModal,
        setShowGuidelinesModal,
        reportingUser,
        setReportingUser,
        showOnboardingModal,
        setShowOnboardingModal,
        onboardingReason,
        setOnboardingReason,
        isUserVerified,
        requireVerification,
        blockedUserIds,
        blockUser,
        unblockUser,
        reportUser,
        radarMembers,
        setRadarMembers,
        isRadarBroadcastOn,
        setIsRadarBroadcastOn,
        invitedUserIds,
        selectedRadarUser,
        setSelectedRadarUser,
        sendCrewInvite,
        getUserById,
        getPlanDistance,
        updateCurrentUserProfile,
        createPlan,
        requestToJoinPlan,
        acceptJoinRequest,
        rejectJoinRequest,
        hostEarlyUnlockPlan,
        hostUpdateCapacity,
        sendMessage,
        triggerEmergencySOS,
        submitKarmaReview,
        waves,
        sendWave,
        hasWavedAt,
        hasReceivedWaveFrom,
        isMutualWave,
        toastMessage,
        setToastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

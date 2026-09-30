import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CURRENT_USER, OTHER_USERS, INITIAL_PLANS } from '../userData';
import { VERIFIED_VENUES, calculateDistanceKm } from '../venueData';
import { NEARBY_RADAR_MEMBERS } from '../radarData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AppContext = createContext();

// Force wipe any old browser localStorage cache immediately on script execution
try {
  const version = localStorage.getItem('squadin_data_version');
  if (version !== 'clean_v3') {
    localStorage.removeItem('squadin_plans');
    localStorage.removeItem('squadin_current_user');
    localStorage.removeItem('squadin_onboarded');
    localStorage.removeItem('squadin_blocked_users');
    localStorage.setItem('squadin_data_version', 'clean_v3');
  }
} catch (e) {
  // ignore
}

// Convert database row to frontend plan object
const mapRowToPlan = (row, messages = []) => ({
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
  pendingRequests: [],
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

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('squadin_current_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [allUsers, setAllUsers] = useState(() => {
    return [CURRENT_USER, ...OTHER_USERS];
  });

  // Strict: 100% clean plans array
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('squadin_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'radar', 'my_crews', 'chats', 'profile'
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState(null);
  const [activeChatPlanId, setActiveChatPlanId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [karmaReviewPlan, setKarmaReviewPlan] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showPwaInstall, setShowPwaInstall] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(isSupabaseConfigured);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [reportingUser, setReportingUser] = useState(null); // { user, planId }
  const [blockedUserIds, setBlockedUserIds] = useState(() => {
    try {
      const saved = localStorage.getItem('squadin_blocked_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Radar State
  const [radarMembers, setRadarMembers] = useState(NEARBY_RADAR_MEMBERS);
  const [isRadarBroadcastOn, setIsRadarBroadcastOn] = useState(true);
  const [invitedUserIds, setInvitedUserIds] = useState([]);
  const [selectedRadarUser, setSelectedRadarUser] = useState(null);

  // User's Live GPS Coordinates
  const [userCoords, setUserCoords] = useState({
    lat: 12.9344,
    lng: 77.6288,
    isRealGPS: false
  });

  // Fetch real device location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isRealGPS: true
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('squadin_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('squadin_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // SUPABASE REALTIME & DATABASE SYNC ENGINE
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Fetch initial plans and messages from Supabase
    const initCloudData = async () => {
      try {
        const { data: cloudPlans, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: false });

        if (!plansError && cloudPlans) {
          const { data: cloudMessages } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });

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
            return mapRowToPlan(cp, planMsgs);
          });

          if (formattedPlans.length > 0) {
            setPlans(formattedPlans);
          }
        }
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    };

    initCloudData();

    // 2. Realtime WebSocket subscriptions for Plans & Messages
    const plansSubscription = supabase
      .channel('public:plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newPlan = mapRowToPlan(payload.new, []);
          setPlans(prev => [newPlan, ...prev.filter(p => p.id !== newPlan.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setPlans(prev => prev.map(p => {
            if (p.id === payload.new.id) {
              return {
                ...p,
                ...mapRowToPlan(payload.new, p.messages)
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

    return () => {
      supabase.removeChannel(plansSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, []);

  // Update profile
  const updateCurrentUserProfile = async (updates) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers(users => users.map(u => u.id === currentUser.id ? updated : u));
    localStorage.setItem('squadin_current_user', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: updated.id,
          name: updated.name,
          avatar: updated.avatar,
          bio: updated.bio,
          city: updated.city || selectedCity,
          role: updated.role,
          company: updated.company,
          phone_verified: updated.phoneVerified,
          work_email_verified: updated.workEmailVerified,
          linkedin_verified: updated.linkedInVerified,
          karma_score: updated.karmaScore,
          phone_number: updated.phoneNumber
        });
      } catch (e) {
        console.warn('Profile sync notice:', e);
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
    const matchedVenue = VERIFIED_VENUES.find(v => v.name.toLowerCase().includes(planData.venueName.toLowerCase())) || {
      lat: userCoords.lat + (Math.random() * 0.02 - 0.01),
      lng: userCoords.lng + (Math.random() * 0.02 - 0.01)
    };

    const isMatched = VERIFIED_VENUES.some(v => v.name.toLowerCase().includes(planData.venueName.toLowerCase()));

    const newPlan = {
      id: `plan_${Date.now()}`,
      title: planData.title,
      category: planData.category || 'cafe',
      categoryLabel: planData.categoryLabel || 'Hangout',
      hostId: currentUser.id,
      city: planData.city || selectedCity,
      venueName: planData.venueName,
      venueLat: planData.venueLat ?? matchedVenue.lat,
      venueLng: planData.venueLng ?? matchedVenue.lng,
      neighborhood: planData.neighborhood || `${selectedCity}`,
      dateText: planData.dateText,
      targetCapacity: parseInt(planData.targetCapacity, 10) || 4,
      status: 'OPEN',
      womenOnly: Boolean(planData.womenOnly),
      isVerifiedVenue: isMatched || Boolean(planData.isVerifiedVenue),
      venueType: isMatched ? 'Verified Commercial Spot' : (planData.venueType || 'Public Landmark / Custom Venue'),
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
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('plans').insert(mapPlanToRow(newPlan));
      } catch (err) {
        console.warn('Plan cloud sync notice:', err);
      }
    }
  };

  // 2. Request to Join Plan
  const requestToJoinPlan = (planId, userMessage = 'Hey! Would love to join your crew.') => {
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
            requestedAt: 'Just now',
            message: userMessage
          }
        ]
      };
    }));
  };

  // 3. Host Accepts Request
  const acceptJoinRequest = async (planId, userId) => {
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

    if (isSupabaseConfigured && supabase && updatedPlanTarget) {
      try {
        await supabase
          .from('plans')
          .update({
            accepted_members: updatedPlanTarget.acceptedMembers,
            status: updatedPlanTarget.status
          })
          .eq('id', planId);
      } catch (err) {
        console.warn('Accept request cloud sync notice:', err);
      }
    }
  };

  // 4. Host Rejects Request
  const rejectJoinRequest = (planId, userId) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        pendingRequests: p.pendingRequests.filter(r => r.userId !== userId)
      };
    }));
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

    if (isSupabaseConfigured && supabase && updatedPlanTarget) {
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

    if (isSupabaseConfigured && supabase && updatedTarget) {
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

    if (isSupabaseConfigured && supabase) {
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
        localStorage.setItem('squadin_blocked_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const unblockUser = (userId) => {
    setBlockedUserIds(prev => {
      const updated = prev.filter(id => id !== userId);
      try {
        localStorage.setItem('squadin_blocked_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const reportUser = async (reportData) => {
    if (isSupabaseConfigured && supabase) {
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
        showPwaInstall,
        setShowPwaInstall,
        isCloudConnected,
        showGuidelinesModal,
        setShowGuidelinesModal,
        reportingUser,
        setReportingUser,
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
        submitKarmaReview
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

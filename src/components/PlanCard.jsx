import React from 'react';
import { MapPin, CalendarDays, BadgeCheck, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityArt, Avatar, AvatarStack, SpotMeter, categoryFor, sameId, trustScore } from './DesignKit';
export function PlanCard({ plan, crew = false, index = 0 }) {
  const { getUserById, getPlanDistance, currentUser, setSelectedPlanForDetail, setActiveChatPlanId, setActiveTab, requestToJoinPlan, requireVerification } = useApp();
  const cat = categoryFor(plan.category);
  const host = getUserById(plan.hostId);
  const isHost = sameId(plan.hostId, currentUser.id);
  const isMember = plan.acceptedMembers?.some(id => sameId(id, currentUser.id));
  const isPending = plan.pendingRequests?.some(r => sameId(r.userId, currentUser.id));
  const filled = plan.acceptedMembers?.length || 0;
  const full = filled >= plan.targetCapacity;
  const openDetail = () => setSelectedPlanForDetail(plan);
  const openChat = () => { setActiveChatPlanId(plan.id); setActiveTab('chats'); };
  const join = e => {
    e.stopPropagation();
    if (isHost || isMember || isPending) return openDetail();
    requireVerification(() => { requestToJoinPlan(plan.id, ''); openDetail(); }, 'join_plan');
  };
  if (crew) return <article className="crew-ticket" style={{ '--ticket-color': isHost ? '#f6cd7d' : cat.color }}><button className="crew-ticket-heading" onClick={openDetail}><h3><ActivityArt type={cat.id} size={30} />{plan.title}</h3><p>{plan.neighborhood} · {plan.dateText}</p></button><div className="crew-ticket-members"><AvatarStack ids={plan.acceptedMembers} size={29} /><span className="pill pill-mint">{filled}/{plan.targetCapacity} confirmed ✓</span></div><div className="crew-ticket-actions">{isHost && <button className="button button-cream" onClick={openDetail}>📩 {plan.pendingRequests?.length || 0} Join Requests</button>}<button className="button button-cream" onClick={openChat}><MessageCircle size={15} />{plan.status === 'LOCKED_CHAT_ACTIVE' ? 'Crew Chat' : 'Waiting room'}</button></div><span className="ticket-perforation" /></article>;
  return <article className={`plan-ticket ticket-tilt-${index % 3}`} style={{ '--ticket-color': cat.color }}><button className="plan-ticket-main" onClick={openDetail} aria-label={`View ${plan.title}`}><div className="ticket-art"><ActivityArt type={cat.id} size={80} /><span>{cat.label}</span></div><div className="ticket-content"><div className="ticket-tags"><span className="pill" style={{ background: cat.color }}>{cat.label}</span>{plan.womenOnly && <span className="pill pill-pink">Women only</span>}<span className="ticket-star">✧</span></div><h3>{plan.title}</h3><p className="ticket-meta"><MapPin size={12} />{plan.neighborhood || plan.city}<span>· {getPlanDistance(plan)}</span></p><p className="ticket-meta"><CalendarDays size={12} />{plan.dateText}</p></div></button><div className="ticket-bottom"><div className="ticket-host"><span className="host-avatar"><Avatar user={host} size={34} />{trustScore(host) > 0 && <BadgeCheck className="host-check" size={15} fill="#ffcf75" />}</span><div><span className="host-label">{isHost ? 'Hosted by you' : `With ${host.name?.split(' ')[0] || 'your host'}`}</span><SpotMeter filled={filled} total={plan.targetCapacity} /></div></div><div className="ticket-join"><span>{filled}/{plan.targetCapacity} spots</span><button className="button button-yellow" onClick={join} disabled={full && !isMember && !isHost && !isPending}>{isHost ? 'Manage Crew' : isMember ? 'Your Crew' : isPending ? 'Requested ✓' : full ? 'Crew Full' : 'Join Crew'}<span aria-hidden="true">🎟️</span></button></div></div></article>;
}

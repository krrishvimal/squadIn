import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Star, MessageCircle, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityArt, Avatar, AvatarStack, Sheet, categoryFor, sameId, normId, trustScore } from './DesignKit';
export function PlanDetailModal() {
  const { plans, selectedPlanForDetail, setSelectedPlanForDetail, getUserById, getPlanDistance, currentUser, requestToJoinPlan, acceptJoinRequest, rejectJoinRequest, leavePlan, removeMemberFromPlan, setActiveChatPlanId, setActiveTab, requireVerification, fetchPlanRequests, requestNotificationPermission } = useApp();
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  useEffect(() => {
    setNote('');
    setShowNote(false);
    setNoteSent(false);
    if (selectedPlanForDetail?.id && fetchPlanRequests) {
      fetchPlanRequests(selectedPlanForDetail.id);
    }
  }, [selectedPlanForDetail?.id]);
  if (!selectedPlanForDetail) return null;
  const plan = plans.find(p => sameId(p.id, selectedPlanForDetail.id)) || selectedPlanForDetail;
  const host = getUserById(plan.hostId);
  const cat = categoryFor(plan.category);
  const members = plan.acceptedMembers || [];
  const uniqueMembers = Array.from(new Set(members.map(id => normId(id))))
    .map(nid => members.find(id => normId(id) === nid))
    .filter(Boolean);
  const isHost = sameId(plan.hostId, currentUser.id);
  const isMember = uniqueMembers.some(id => sameId(id, currentUser.id));
  const pendingApplicants = (plan.pendingRequests || []).filter(req => 
    !uniqueMembers.some(mId => sameId(mId, req.userId))
  );
  const pending = !isMember && pendingApplicants.some(r => sameId(r.userId, currentUser.id));
  const unlocked = plan.status === 'LOCKED_CHAT_ACTIVE';
  const spots = Math.max(0, plan.targetCapacity - uniqueMembers.length);
  const close = () => setSelectedPlanForDetail(null);
  const chat = () => { setActiveChatPlanId(plan.id); setActiveTab('chats'); close(); };
  return <Sheet title={isHost ? 'Host dashboard' : plan.title} className={`detail-sheet ${isHost ? 'host-sheet' : ''}`} onClose={close}>
    {isHost ? <div className="sheet-title"><span className="eyebrow">BRING YOUR PEOPLE TOGETHER</span><h2>⚡ Host Dashboard</h2><p>{plan.title}</p></div> : <><div className="detail-art" style={{ background: cat.color }}><ActivityArt type={cat.id} size={104} /></div><div className="detail-heading"><span className="eyebrow">{cat.full} {plan.womenOnly ? '· WOMEN ONLY' : '· YOUR WEEKEND, SORTED'}</span><h1>{plan.title}</h1><div className="detail-host"><Avatar user={host} size={35} /><span>Hosted by <strong>{host.name}</strong></span>{host.karmaScore != null && <span className="host-rating"><Star size={15} fill="#ffc666" />{host.karmaScore}</span>}{trustScore(host) > 0 && <ShieldCheck size={19} />}</div></div></>}
    <div className="detail-body"><div className="detail-meta"><span><CalendarDays size={14} />{plan.dateText}</span><span><MapPin size={14} />{plan.neighborhood || plan.city}</span></div>
      <div className="crew-progress"><div className="quorum-gauge"><svg viewBox="0 0 100 60" aria-hidden="true"><path d="M10 50a40 40 0 0 1 80 0" fill="none" stroke="#eddfc8" strokeWidth="13" strokeLinecap="round" /><path d="M10 50a40 40 0 0 1 80 0" fill="none" stroke="#ffbf60" strokeWidth="13" strokeLinecap="round" pathLength="100" strokeDasharray={`${Math.min(100, uniqueMembers.length / plan.targetCapacity * 100)} 100`} /></svg><strong>{uniqueMembers.length}/{plan.targetCapacity}</strong></div><AvatarStack ids={uniqueMembers} size={32} /><strong>{spots ? `${spots} spots left!` : 'Crew complete! 🎉'}</strong></div>
      {isHost && <><div className="dashboard-filled"><div className="dashboard-fill" style={{ width: `${uniqueMembers.length / plan.targetCapacity * 100}%` }} /><strong>{uniqueMembers.length}/{plan.targetCapacity} Crew Filled</strong><AvatarStack ids={uniqueMembers} size={28} /></div><h3 className="section-title">📩 Pending Requests ({pendingApplicants.length})</h3><div className="applicant-list">{pendingApplicants.length ? pendingApplicants.map(req => { const applicant = getUserById(req.userId); const score = trustScore(applicant); return <div className="applicant-card" key={req.userId}><div className="applicant-heading"><Avatar user={applicant} size={54} /><div><div className="applicant-name"><h3>{applicant.name}</h3><span className={`pill ${score > 0 ? 'pill-mint' : 'pill-muted'}`}>{score > 0 ? '✓ Verified' : 'New Member'}</span></div><div className="mini-trust"><span>Trust meter</span><span className="mini-trust-bar"><i style={{ width: `${score}%` }} /></span><strong>{score}%</strong></div></div></div>{req.message && <p className="applicant-note">{req.message}</p>}<div className="applicant-actions"><button className="button button-green" disabled={!spots} onClick={() => acceptJoinRequest(plan.id, req.userId)}>Accept 🎟️</button><button className="button button-muted" onClick={() => rejectJoinRequest(plan.id, req.userId)}>Decline</button></div></div>; }) : <p className="quiet-box">Your future crew is finding you. Join requests will appear here.</p>}</div><h3 className="section-title">✅ Confirmed Crew ({uniqueMembers.length})</h3><div className="confirmed-members">{uniqueMembers.map(id => { const member = getUserById(id); const notHost = !sameId(id, currentUser.id); return <div key={id} style={{ position: 'relative' }}><Avatar user={member} size={51} /><span>{member.name?.split(' ')[0]}</span>{notHost && <button title="Remove member & reopen spot" aria-label={`Remove ${member.name}`} style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }} onClick={() => { if (window.confirm(`Remove ${member.name} from the crew? This will reopen their spot for other applicants.`)) { removeMemberFromPlan(plan.id, id); } }}>✕</button>}</div>; })}</div></>}
      {!isHost && <section className="description-card"><h3>Description</h3><p>{plan.description || 'A small crew and a lovely shared plan. Come as you are.'}</p></section>}
      <a className="venue-card" href={`https://www.google.com/maps/search/?api=1&query=${plan.venueLat && plan.venueLng ? `${plan.venueLat},${plan.venueLng}` : encodeURIComponent(plan.venueName + ', ' + plan.city)}`} target="_blank" rel="noreferrer"><span className="venue-pin"><MapPin size={24} /></span><span><strong>{plan.venueName}</strong><small>{getPlanDistance(plan)} away · {plan.isVerifiedVenue ? 'Verified public venue' : 'Meet somewhere public'}</small></span><ExternalLink size={16} /></a>
    </div>
    <div className="detail-footer">{isMember || isHost ? <>{!isHost && <div className="celebration-stub"><span className="celebration-spark">✦ 🎟️ ✧</span><h3>You’re In! Welcome to the Crew!</h3><AvatarStack ids={uniqueMembers} size={27} /></div>}<button className={`button wide-button ${unlocked ? 'button-green' : 'button-yellow'}`} onClick={chat}>{unlocked ? <MessageCircle size={18} /> : <Lock size={17} />}{unlocked ? 'Open Crew Chat' : 'View Crew Waiting Room'}</button><p className="footnote">{unlocked ? 'Your crew is ready. Let the weekend begin.' : `Chat opens when all ${plan.targetCapacity} spots are confirmed.`}</p>{!isHost && <button className="text-button leave-crew-button" style={{ color: '#b34747', fontSize: '11px', marginTop: '8px', cursor: 'pointer' }} onClick={() => { if (window.confirm("Can't make it? Leaving will reopen your spot for someone else on the waiting list.")) { leavePlan(plan.id); close(); } }}>Can’t make it? Leave crew</button>}</> : pending ? <><div className="request-confirmed">✓ Request sent. Your host will take it from here!</div>{!showNote ? <button className="text-button optional-note-button" onClick={() => setShowNote(true)}>💬 {noteSent ? 'Note sent ✓' : 'Add a quick note to the host (optional)'}</button> : <form className="optional-note-form" onSubmit={e => { e.preventDefault(); requestToJoinPlan(plan.id, note.trim()); setShowNote(false); setNoteSent(true); }}><textarea id="plan-join-note" name="joinNote" aria-label="Note to the host" rows={2} maxLength={400} value={note} onChange={e => setNote(e.target.value)} placeholder="Love cafes! Count me in 🙌" /><button className="button button-yellow" type="submit">Send note</button></form>}</> : <><button className="button button-yellow wide-button" disabled={!spots} onClick={() => requireVerification(() => { if (requestNotificationPermission) requestNotificationPermission(); requestToJoinPlan(plan.id, ''); }, 'join_plan')}>{spots ? 'Join This Crew 🎟️' : 'This crew is full'}</button><p className="footnote">A quick request. A new little crew.<br />Chat opens when your crew is confirmed 💬</p></>}</div>
  </Sheet>;
}

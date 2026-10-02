import React, { useState } from 'react';
import { ShieldCheck, Plus, Check, Heart, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VerificationModal } from './VerificationModal';
import { Avatar, ActivityArt, Sheet, CityPicker, trustScore, sameId } from './DesignKit';
import { PASSION_TO_CATEGORY_MAP } from '../venueData';
const PASSIONS = Object.keys(PASSION_TO_CATEGORY_MAP);
export function ProfileView() {
  const { currentUser, plans, setShowGuidelinesModal, updateCurrentUserProfile } = useApp();
  const [verify, setVerify] = useState(null);
  const [edit, setEdit] = useState(false);
  const [passions, setPassions] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBio, setEditBio] = useState('');
  const score = trustScore(currentUser);
  const hosted = plans.filter(p => sameId(p.hostId, currentUser.id)).length;
  const badges = [
    { id: 'phone', label: 'Phone', boost: 50, verified: Boolean(currentUser.phoneVerified || currentUser.phone_verified), art: 'phone' },
    { id: 'selfie', label: 'Selfie', boost: 30, verified: Boolean(currentUser.idVerified || currentUser.id_verified || currentUser.avatar?.startsWith('data:image')), icon: '📷' },
    { id: 'linkedin', label: 'LinkedIn', boost: 20, verified: Boolean(currentUser.linkedin_verified || currentUser.linkedInVerified), icon: 'in' }
  ];

  const openEdit = () => {
    setEditName(currentUser?.name !== 'Verified Member' ? currentUser?.name || '' : '');
    setEditCity(currentUser?.city || 'Pune');
    setEditBio(currentUser?.bio || '');
    setEdit(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateCurrentUserProfile({
      name: editName.trim(),
      city: editCity,
      bio: editBio.trim()
    });
    setEdit(false);
  };

  return <div className="screen profile-screen"><div className="profile-title"><span className="eyebrow">YOUR LITTLE CORNER</span><button className="icon-button" aria-label="Community trust and safety" onClick={() => setShowGuidelinesModal(true)}>•••</button></div><div className="profile-summary"><div className="profile-identity"><div className="profile-avatar-ring"><Avatar user={currentUser} size={90} /></div><h1>{currentUser.name && currentUser.name !== 'Verified Member' ? currentUser.name : 'Hello, weekend explorer'}</h1><p>{currentUser.city || 'Your city'} <span>·</span> Your kind of people await ✧</p>{currentUser.bio ? <p className="profile-bio">"{currentUser.bio}"</p> : <button className="text-button" style={{ fontSize: '11px', color: '#b28d54', marginTop: '6px', cursor: 'pointer' }} onClick={openEdit}>✍️ Add a bio so your crew gets to know you</button>}</div><div className="profile-stats"><div><strong>{currentUser.meetupsAttended || 0} weekends</strong><span>squaded 🎉</span></div><div><strong>{hosted} crews</strong><span>hosted ⚡</span></div><div><strong>{Number(currentUser.karmaScore || 0).toFixed(1)} ⭐</strong><span>karma</span></div></div></div><div className="profile-details"><section className="profile-trust"><div className="section-row"><h2><ShieldCheck size={21} fill="#a6d9e8" />Trust Score <span>✧</span></h2><strong>{score}% {score >= 80 ? 'Trusted ✧' : ''}</strong></div><div className="trust-rainbow" role="progressbar" aria-label="Trust score" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${score}%` }} /><span style={{ left: `calc(${Math.min(93, Math.max(7, score))}% - 12px)` }}>✧</span></div><p className="trust-caption">{score === 100 ? 'All badges collected. Your crew can count on you.' : 'Collect verification badges to help your crew know you.'}</p></section><section><h2 className="section-title">Verification Badges</h2><div className="verification-badges">{badges.map(b => <button className={`verification-badge ${b.verified ? 'verified' : ''}`} key={b.id} onClick={() => setVerify(b.id)} aria-label={`${b.label} verification ${b.verified ? 'completed' : 'adds ' + b.boost + ' percent trust'}`}><span className={`badge-rosette badge-${b.id}`}>{b.art ? <ActivityArt type={b.art} size={41} /> : <span>{b.icon}</span>}</span><strong>{b.label}</strong><span>+{b.boost}% Trust</span><small className={b.verified ? 'badge-status verified' : 'badge-status'}>{b.verified ? '✓ Verified' : 'Verify Now'}</small></button>)}</div></section><section className="passions-section"><h2 className="section-title">Weekend Passions</h2><div className="passion-tags">{(currentUser.interests || []).map((p, i) => <span key={p} className={`pill passion-color-${i % 4}`}>{p}</span>)}<button className="add-passion" onClick={() => setPassions(true)} aria-label="Edit weekend passions"><Plus size={17} /></button></div></section><button className="button button-outline wide-button" onClick={openEdit}><Edit3 size={15} style={{ marginRight: '6px' }} /> Edit Profile & Bio</button><button className="profile-safety" onClick={() => setShowGuidelinesModal(true)}><Heart size={15} /><span>Made for friendship. Built on trust.</span><span>↗</span></button></div><VerificationModal isOpen={verify !== null} initialTab={verify || 'phone'} onClose={() => setVerify(null)} />{edit && <Sheet title="Edit Profile" onClose={() => setEdit(false)}><div className="sheet-title"><h2>Edit Your Profile ✍️</h2><p>Introduce yourself to your weekend squad.</p></div><form onSubmit={handleSaveProfile} className="onboarding-form" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}><div><label htmlFor="edit-name" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#4a3b2c' }}>Your Name</label><div className="input-with-icon"><span>👋</span><input id="edit-name" type="text" maxLength={40} required value={editName} onChange={e => setEditName(e.target.value)} placeholder="What should people call you?" /></div></div><div><label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#4a3b2c' }}>Your City</label><CityPicker value={editCity} onChange={setEditCity} /></div><div><label htmlFor="edit-bio" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#4a3b2c' }}>About You / Weekend Bio</label><textarea id="edit-bio" rows={3} maxLength={200} value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="What kind of weekends do you love? (e.g. Specialty coffee, morning walks, board games, live gigs...)" style={{ width: '100%', borderRadius: '14px', border: '1px solid #d5c3aa', padding: '10px 12px', fontSize: '13px', background: '#fffaf0', color: '#3c2e1e', outline: 'none', resize: 'none' }} /><small style={{ display: 'block', textAlign: 'right', fontSize: '10px', color: '#99816b', marginTop: '2px' }}>{editBio.length}/200</small></div><button className="button button-yellow wide-button" type="submit" style={{ marginTop: '8px' }}>Save Profile Changes ✓</button></form></Sheet>}{passions && <Sheet title="Your weekend passions" onClose={() => setPassions(false)}><div className="sheet-title"><h2>Your kind of weekend ✧</h2><p>Choose the things you’d love to do with your crew.</p></div><div className="passion-picker">{PASSIONS.map(p => { const active = currentUser.interests?.includes(p); return <button key={p} className={`button ${active ? 'button-yellow' : 'button-outline'}`} onClick={() => updateCurrentUserProfile({ interests: active ? currentUser.interests.filter(i => i !== p) : [...(currentUser.interests || []), p] })}>{p}{active && <Check size={16} />}</button>; })}</div><button className="button button-yellow wide-button passion-done" onClick={() => setPassions(false)}>That’s my weekend!</button></Sheet>}</div>;
}

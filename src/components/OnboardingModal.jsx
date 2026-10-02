import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { appStorage } from '../designPreview';
import { ActivityArt, Brand, CityPicker, Sheet } from './DesignKit';
export function OnboardingModal({ isOpen, onClose, reason }) {
  const { currentUser, updateCurrentUserProfile, selectedCity } = useApp();
  const [name, setName] = useState('');
  const [city, setCity] = useState(selectedCity);
  const [gender, setGender] = useState(currentUser?.gender || 'unspecified');
  const [bio, setBio] = useState('');
  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name !== 'Verified Member' ? currentUser?.name || '' : '');
      setCity(selectedCity);
      setBio(currentUser?.bio || '');
      if (currentUser?.gender) {
        setGender(currentUser.gender);
      }
    }
  }, [isOpen, selectedCity]);
  if (!isOpen) return null;
  const submit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    appStorage.setItem('squadin_onboarded', 'true');
    updateCurrentUserProfile({ name: name.trim(), city, bio: bio.trim(), gender });
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#ffc966', '#c7b3e8', '#a9d6bd', '#f4ac99'] });
    onClose();
  };
  return <Sheet title="Join SquadIn" className="onboarding-sheet" onClose={onClose}>
    <div className="onboarding-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
    <div className="onboarding-brand"><Brand /></div>
    <div className="onboarding-heading"><span className="eyebrow">YOUR PEOPLE ARE OUT THERE</span><h1>Find Your<br />Weekend Crew</h1><p>Real plans. Real people. Real fun.</p></div>
    <ActivityArt type="cafe" className="onboarding-doodle doodle-coffee" size={68} /><ActivityArt type="hike" className="onboarding-doodle doodle-boot" size={65} />
    <form onSubmit={submit} className="onboarding-form">
      <label htmlFor="onboarding-name">What should we call you?</label>
      <div className="input-with-icon"><span>👋</span><input id="onboarding-name" name="name" autoComplete="name" maxLength={40} required value={name} onChange={e => setName(e.target.value)} placeholder="Your name or nickname" /></div>
      
      <label htmlFor="onboarding-city">Your City</label>
      <CityPicker id="onboarding-city" name="city" value={city} onChange={setCity} />

      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginTop: '10px', marginBottom: '6px', color: '#4a3b2c' }}>
        Your Identity <span style={{ fontWeight: 'normal', color: '#8c7662', fontSize: '11px' }}>(helps unlock Women-Only spaces)</span>
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
        {[
          { id: 'female', label: 'Woman 👩' },
          { id: 'male', label: 'Man 👨' },
          { id: 'other', label: 'Other ✧' }
        ].map(g => (
          <button
            type="button"
            key={g.id}
            onClick={() => setGender(g.id)}
            style={{
              flex: 1,
              padding: '9px 4px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              border: gender === g.id ? '2px solid #f59e0b' : '1px solid #d5c3aa',
              background: gender === g.id ? '#fef3c7' : '#fffaf0',
              color: gender === g.id ? '#92400e' : '#57422f',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      <label htmlFor="onboarding-bio">About you (Optional)</label>
      <textarea id="onboarding-bio" rows={2} maxLength={180} value={bio} onChange={e => setBio(e.target.value)} placeholder="What kind of weekends do you love? (e.g. coffee walks, board games, live gigs...)" />
      
      <p className="trust-later">📱 Add phone later for +50% trust boost <span>✧</span></p>
      <button className="button button-yellow onboarding-submit" type="submit">{reason === 'create_plan' ? 'Continue to Post' : reason === 'join_plan' ? 'Continue to Join' : 'Start Exploring'}<ArrowRight size={20} /></button>
      <button className="text-button skip-button" type="button" onClick={() => { appStorage.setItem('squadin_skip_initial', 'true'); onClose(); }}>Skip for now</button>
    </form>
    <div className="onboarding-bottom-art" aria-hidden="true"><ActivityArt type="cafe" size={59} /><span>Little plans.<br />Lovely people.</span><ActivityArt type="concert" size={102} /></div>
  </Sheet>;
}

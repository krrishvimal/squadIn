import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { appStorage } from '../designPreview';
import { ActivityArt, Brand, CityPicker, Sheet } from './DesignKit';
export function OnboardingModal({ isOpen, onClose, reason }) {
  const { currentUser, updateCurrentUserProfile, selectedCity, setSelectedCity } = useApp();
  const [name, setName] = useState('');
  const [city, setCity] = useState(selectedCity);
  const [bio, setBio] = useState('');
  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name !== 'Verified Member' ? currentUser?.name || '' : '');
      setCity(selectedCity);
      setBio(currentUser?.bio || '');
    }
  }, [isOpen, selectedCity]);
  if (!isOpen) return null;
  const submit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    appStorage.setItem('squadin_onboarded', 'true');
    updateCurrentUserProfile({ name: name.trim(), city, bio: bio.trim() });
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#ffc966', '#c7b3e8', '#a9d6bd', '#f4ac99'] });
    onClose();
  };
  return <Sheet title="Join SquadIn" className="onboarding-sheet" onClose={onClose}>
    <div className="onboarding-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
    <div className="onboarding-brand"><Brand /></div>
    <div className="onboarding-heading"><span className="eyebrow">YOUR PEOPLE ARE OUT THERE</span><h1>Find Your<br />Weekend Crew</h1><p>Real plans. Real people. Real fun.</p></div>
    <ActivityArt type="cafe" className="onboarding-doodle doodle-coffee" size={68} /><ActivityArt type="hike" className="onboarding-doodle doodle-boot" size={65} />
    <form onSubmit={submit} className="onboarding-form"><label htmlFor="onboarding-name">What should we call you?</label><div className="input-with-icon"><span>👋</span><input id="onboarding-name" autoComplete="given-name" maxLength={40} required value={name} onChange={e => setName(e.target.value)} placeholder="Your name or nickname" /></div><label>Your City</label><CityPicker value={city} onChange={setCity} /><label htmlFor="onboarding-bio">About you (Optional)</label><textarea id="onboarding-bio" rows={2} maxLength={180} value={bio} onChange={e => setBio(e.target.value)} placeholder="What kind of weekends do you love? (e.g. coffee walks, board games, live gigs...)" /><p className="trust-later">📱 Add phone later for +50% trust boost <span>✧</span></p><button className="button button-yellow onboarding-submit" type="submit">{reason === 'create_plan' ? 'Continue to Post' : reason === 'join_plan' ? 'Continue to Join' : 'Start Exploring'}<ArrowRight size={20} /></button><button className="text-button skip-button" type="button" onClick={() => { appStorage.setItem('squadin_skip_initial', 'true'); onClose(); }}>Skip for now</button></form>
    <div className="onboarding-bottom-art" aria-hidden="true"><ActivityArt type="cafe" size={59} /><span>Little plans.<br />Lovely people.</span><ActivityArt type="concert" size={102} /></div>
  </Sheet>;
}

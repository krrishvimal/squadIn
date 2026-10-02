import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, ShieldCheck, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityArt, Sheet, CATEGORIES } from './DesignKit';
const nextSaturday = () => {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((6 - today.getDay() + 7) % 7));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const TIMES = [{ label: '🌅 Morning', value: '10:00 AM' }, { label: '☀ Afternoon', value: '2:00 PM' }, { label: '🌇 Evening', value: '5:00 PM' }, { label: '☾ Night', value: '8:00 PM' }];
export function CreatePlanModal() {
  const { showCreateModal, setShowCreateModal, createPlan, selectedCity, currentUser } = useApp();
  const [form, setForm] = useState({ title: '', venueName: '', neighborhood: '', category: 'cafe', date: nextSaturday(), time: '5:00 PM', targetCapacity: 6, description: '', womenOnly: false });
  const [more, setMore] = useState(false);
  const [publishing, setPublishing] = useState(false);
  if (!showCreateModal) return null;
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const submit = async e => {
    e.preventDefault();
    if (publishing) return;
    setPublishing(true);
    try {
      await createPlan({ ...form, categoryLabel: CATEGORIES.find(c => c.id === form.category).full, city: selectedCity, dateText: `${new Date(form.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} · ${form.time}`, description: form.description.trim() || 'A little weekend plan with a small crew. Come as you are and let’s make a memory together.' });
      setForm({ title: '', venueName: '', neighborhood: '', category: 'cafe', date: nextSaturday(), time: '5:00 PM', targetCapacity: 6, description: '', womenOnly: false }); setMore(false);
    } finally { setPublishing(false); }
  };
  return <Sheet title="Post your weekend plan" className="create-sheet" onClose={() => setShowCreateModal(false)}><div className="sheet-title"><span className="eyebrow">GOOD WEEKENDS START WITH A PLAN</span><h2>📋 Post Your Weekend Plan <span>✧</span></h2></div><form onSubmit={submit} className="plan-form"><fieldset><legend>Pick your kind of fun</legend><div className="create-category-grid">{CATEGORIES.map(cat => <button type="button" key={cat.id} className={`create-category ${form.category === cat.id ? 'selected' : ''}`} style={{ background: cat.color }} onClick={() => set('category', cat.id)} aria-pressed={form.category === cat.id}><ActivityArt type={cat.id} size={46} /><span>{cat.id === 'cafe' ? cat.full : cat.label}</span></button>)}</div></fieldset><label htmlFor="plan-title">Plan Title</label><input id="plan-title" required maxLength={90} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Sunday Cafe Crawl in Indiranagar" /><label htmlFor="plan-venue">Venue <span className="label-hint">somewhere public, please</span></label><input id="plan-venue" required maxLength={140} value={form.venueName} onChange={e => set('venueName', e.target.value)} placeholder="Third Wave Coffee, 12th Main" /><label htmlFor="plan-date">Date & Time</label><div className="date-field"><CalendarDays size={17} /><input id="plan-date" type="date" required min={new Date().toLocaleDateString('en-CA')} value={form.date} onChange={e => set('date', e.target.value)} /></div><div className="time-pills">{TIMES.map(time => <button type="button" key={time.value} className={form.time === time.value ? 'selected' : ''} onClick={() => set('time', time.value)} aria-pressed={form.time === time.value}>{time.label}</button>)}</div><button type="button" className="more-details" onClick={() => setMore(v => !v)} aria-expanded={more}>⚙ More details <span>(optional)</span><ChevronDown size={17} style={{ transform: more ? 'rotate(180deg)' : undefined }} /></button>{more && <div className="optional-fields"><div className="capacity-picker"><div><strong>Crew size</strong><small>Including you. Small is our thing.</small></div><div><button type="button" className="icon-button" disabled={form.targetCapacity <= 3} onClick={() => set('targetCapacity', form.targetCapacity - 1)} aria-label="Fewer crew spots"><Minus size={16} /></button><strong>{form.targetCapacity}</strong><button type="button" className="icon-button" disabled={form.targetCapacity >= 8} onClick={() => set('targetCapacity', form.targetCapacity + 1)} aria-label="More crew spots"><Plus size={16} /></button></div></div><label htmlFor="plan-neighborhood">Neighbourhood</label><input id="plan-neighborhood" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} placeholder="Indiranagar" /><label htmlFor="plan-description">A little about the plan</label><textarea id="plan-description" rows={3} maxLength={1000} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What should your future crew know?" />{currentUser.gender === 'female' && <label className="toggle-row"><span>🌷 Women-only crew</span><input type="checkbox" checked={form.womenOnly} onChange={e => set('womenOnly', e.target.checked)} /></label>}</div>}<p className="form-safety"><ShieldCheck size={15} />Public places. Small crews. Good vibes.</p><button className="button button-yellow publish-button" disabled={publishing} type="submit">{publishing ? 'Posting your plan…' : `Publish to ${selectedCity} Feed ☀`}</button></form></Sheet>;
}

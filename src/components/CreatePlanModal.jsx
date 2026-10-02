import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, ShieldCheck, CalendarDays, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityArt, Sheet, CATEGORIES } from './DesignKit';

const MapPinPicker = React.lazy(() => import('./MapPinPicker').then(m => ({ default: m.MapPinPicker })));

const nextSaturday = () => {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((6 - today.getDay() + 7) % 7));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const TIMES = [{ label: '🌅 Morning', value: '10:00 AM' }, { label: '☀ Afternoon', value: '2:00 PM' }, { label: '🌇 Evening', value: '5:00 PM' }, { label: '☾ Night', value: '8:00 PM' }];
export function CreatePlanModal() {
  const { showCreateModal, setShowCreateModal, createPlan, selectedCity, currentUser, userCoords } = useApp();
  const [form, setForm] = useState({ 
    title: '', 
    venueName: '', 
    neighborhood: '', 
    category: 'cafe', 
    date: nextSaturday(), 
    time: '5:00 PM', 
    targetCapacity: 4, 
    description: '', 
    womenOnly: false,
    venueLat: userCoords?.lat || 18.5204,
    venueLng: userCoords?.lng || 73.8567
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [publishing, setPublishing] = useState(false);
  if (!showCreateModal) return null;
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const submit = async e => {
    e.preventDefault();
    if (publishing) return;
    setPublishing(true);
    try {
      await createPlan({ 
        ...form, 
        categoryLabel: CATEGORIES.find(c => c.id === form.category).full, 
        city: selectedCity, 
        dateText: `${new Date(form.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} · ${form.time}`, 
        description: form.description.trim() || 'A little weekend plan with a small crew. Come as you are and let’s make a memory together.',
        venueLat: form.venueLat,
        venueLng: form.venueLng
      });
      setForm({ 
        title: '', 
        venueName: '', 
        neighborhood: '', 
        category: 'cafe', 
        date: nextSaturday(), 
        time: '5:00 PM', 
        targetCapacity: 4, 
        description: '', 
        womenOnly: false,
        venueLat: userCoords?.lat || 18.5204,
        venueLng: userCoords?.lng || 73.8567
      }); 
      setShowMapPicker(false);
    } finally { setPublishing(false); }
  };
  return (
    <Sheet title="Post your weekend plan" className="create-sheet" onClose={() => setShowCreateModal(false)}>
      <div className="sheet-title">
        <span className="eyebrow">GOOD WEEKENDS START WITH A PLAN</span>
        <h2>📋 Post Your Weekend Plan <span>✧</span></h2>
      </div>
      <form onSubmit={submit} className="plan-form">
        <fieldset>
          <legend>Pick your kind of fun</legend>
          <div className="create-category-grid">
            {CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat.id}
                className={`create-category ${form.category === cat.id ? 'selected' : ''}`}
                style={{ background: cat.color }}
                onClick={() => set('category', cat.id)}
                aria-pressed={form.category === cat.id}
              >
                <ActivityArt type={cat.id} size={46} />
                <span>{cat.id === 'cafe' ? cat.full : cat.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label htmlFor="plan-title">Plan Title</label>
        <input
          id="plan-title"
          required
          maxLength={90}
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Sunday Cafe Crawl in Indiranagar"
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', marginBottom: '6px' }}>
          <label htmlFor="plan-venue" style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#3c2e1e' }}>
            Venue
          </label>
          <button
            type="button"
            className="text-button"
            style={{
              fontSize: '11px',
              color: '#854d0e',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: showMapPicker ? '#fde68a' : '#fef3c7',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid #fcd34d',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onClick={() => setShowMapPicker(v => !v)}
          >
            <MapPin size={12} /> {showMapPicker ? 'Hide map' : 'Pin on map'}
          </button>
        </div>
        <input
          id="plan-venue"
          required
          maxLength={140}
          value={form.venueName}
          onChange={e => set('venueName', e.target.value)}
          placeholder="Third Wave Coffee, 12th Main"
        />
        {showMapPicker && (
          <div style={{ marginTop: '8px', marginBottom: '12px' }}>
            <React.Suspense fallback={<div className="p-4 text-center text-xs text-stone-400">Loading map picker...</div>}>
              <MapPinPicker
                lat={form.venueLat}
                lng={form.venueLng}
                venueLabel={form.venueName || 'Meetup Location'}
                userCoords={userCoords}
                onLocationChange={(newLat, newLng) => {
                  set('venueLat', newLat);
                  set('venueLng', newLng);
                }}
              />
            </React.Suspense>
          </div>
        )}

        <label htmlFor="plan-neighborhood" style={{ marginTop: '12px', display: 'block' }}>
          Area / Neighbourhood
        </label>
        <input
          id="plan-neighborhood"
          value={form.neighborhood}
          onChange={e => set('neighborhood', e.target.value)}
          placeholder="e.g. Indiranagar, Koramangala, Bandra..."
        />

        <label htmlFor="plan-date" style={{ marginTop: '12px', display: 'block' }}>Date & Time</label>
        <div className="date-field">
          <CalendarDays size={17} />
          <input
            id="plan-date"
            type="date"
            required
            min={new Date().toLocaleDateString('en-CA')}
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />
        </div>
        <div className="time-pills">
          {TIMES.map(time => (
            <button
              type="button"
              key={time.value}
              className={form.time === time.value ? 'selected' : ''}
              onClick={() => set('time', time.value)}
              aria-pressed={form.time === time.value}
            >
              {time.label}
            </button>
          ))}
        </div>

        {/* Crew Size (Prominent & Explicit Core Choice) */}
        <div className="capacity-picker" style={{ margin: '16px 0 10px 0', padding: '14px 16px', background: '#fff9eb', border: '1.5px solid #fed7aa', borderRadius: '16px' }}>
          <div>
            <strong style={{ fontSize: '14px', color: '#431407', display: 'block' }}>Crew Size</strong>
            <small style={{ fontSize: '11px', color: '#9a3412', display: 'block', marginTop: '2px' }}>
              {form.targetCapacity} people total (including you) · Chat unlocks when all {form.targetCapacity} spots are confirmed
            </small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="icon-button"
              disabled={form.targetCapacity <= 3}
              onClick={() => set('targetCapacity', form.targetCapacity - 1)}
              aria-label="Fewer crew spots"
            >
              <Minus size={16} />
            </button>
            <strong style={{ fontSize: '18px', color: '#431407', minWidth: '24px', textAlign: 'center' }}>
              {form.targetCapacity}
            </strong>
            <button
              type="button"
              className="icon-button"
              disabled={form.targetCapacity >= 8}
              onClick={() => set('targetCapacity', form.targetCapacity + 1)}
              aria-label="More crew spots"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Women-Only Crew Toggle */}
        <label className="toggle-row" style={{ marginTop: '10px', padding: '10px 14px', background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div>
            <span style={{ fontWeight: '700', fontSize: '13px', color: '#831843', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌷 Women-Only Crew
            </span>
            <small style={{ fontSize: '11px', color: '#9d174d', display: 'block', marginTop: '1px' }}>
              Only verified women can request to join
            </small>
          </div>
          <input
            type="checkbox"
            checked={form.womenOnly}
            onChange={e => set('womenOnly', e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#db2777', cursor: 'pointer' }}
          />
        </label>

        {/* A little about the plan */}
        <label htmlFor="plan-description" style={{ marginTop: '12px', display: 'block' }}>
          A little about the plan <span className="label-hint">(optional)</span>
        </label>
        <textarea
          id="plan-description"
          rows={2}
          maxLength={1000}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="What should your future crew know? (e.g. relaxed coffee walk, bringing card games...)"
        />

        <p className="form-safety">
          <ShieldCheck size={15} />Public places. Small crews. Good vibes.
        </p>
        <button className="button button-yellow publish-button" disabled={publishing} type="submit">
          {publishing ? 'Posting your plan…' : `Publish to ${selectedCity} Feed ☀`}
        </button>
      </form>
    </Sheet>
  );
}

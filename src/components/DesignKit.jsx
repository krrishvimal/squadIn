import React, { useEffect, useRef } from 'react';
import { X, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INDIAN_CITIES } from '../venueData';

export const CATEGORIES = [
  { id: 'cafe', label: 'Cafe', full: 'Cafe & Dinner', color: '#d8c6f2' },
  { id: 'sports', label: 'Sports', full: 'Sports & Run', color: '#bde3ce' },
  { id: 'concert', label: 'Concerts', full: 'Concerts & Gigs', color: '#ffc5a9' },
  { id: 'comedy', label: 'Standup', full: 'Standup & Comedy', color: '#ffdc87' },
  { id: 'arts', label: 'Workshops', full: 'Workshops', color: '#ecdca1' },
  { id: 'hike', label: 'Treks', full: 'Treks & Walks', color: '#bce0c2' },
  { id: 'other', label: 'Other', full: 'Other Activities', color: '#f5bdd4' },
];
export const categoryFor = (id) => CATEGORIES.find(c => c.id === id || c.full === id) || CATEGORIES[6];
export const sameId = (a, b) => a != null && b != null && String(a).toLowerCase().trim() === String(b).toLowerCase().trim();
export const normId = (id) => (id !== null && id !== undefined) ? String(id).trim().toLowerCase() : '';
export const trustScore = (user) => (user?.phoneVerified ? 50 : 0) + (user?.idVerified ? 30 : 0) + (user?.linkedin_verified ? 20 : 0);

// Original vector doodles: sharp at every size, with the ink-and-pastel look of the references.
export function ActivityArt({ type = 'cafe', className = '', size = 64 }) {
  const drawings = {
    cafe: <><path d="M25 66C12 69 9 75 18 80c12 7 43 8 58 0 10-6 2-12-10-14" fill="#efcfad"/><path d="M67 40c23-8 28 18 9 28l-9 2v-8c17-4 19-18 1-15" fill="#fff3db"/><path d="M20 40c1 27 8 37 26 37s25-10 27-37" fill="#fff2d9"/><ellipse cx="46" cy="40" rx="27" ry="9" fill="#d29b79"/><path d="M23 40c13-7 33-7 46 0" fill="none"/><path d="M37 27c-10-9 7-11 0-20m12 20c-9-8 8-11 2-21m10 22c-7-7 7-10 3-16" fill="none"/><path d="M24 75c12 7 31 7 43 0" fill="none"/></>,
    hike: <><path d="M27 14l22 6-3 26 13 13 18 4c11 2 16 9 14 17-23 8-47 5-73-2L16 60l8-16z" fill="#c78d6c"/><path d="M18 73c27 9 51 11 73 1l-1 10c-24 8-48 5-71-2z" fill="#78513e"/><path d="M25 15l17 5-2 19-17-4" fill="#edc29a"/><path d="M36 34l15 3m-17 7l16 2m-13 6l17 2m-10 6l17-3" fill="none"/><path d="M21 61l10 1 2 13M70 64l-4 13" fill="none"/></>,
    sports: <><circle cx="48" cy="49" r="34" fill="#fffaf0"/><path d="M45 35l15 5 1 17-15 8-13-12 4-15z" fill="#40362e"/><path d="M36 17l2 21m29-16l-7 18m21 13l-20 4m4 23L46 65m-26 3l13-15M22 27l-7 20m8 28l14 7m43-13l2-16" fill="none"/></>,
    concert: <><path d="M70 10l10 7-38 51-10-7z" fill="#e4b379"/><path d="M35 48c-11-9-23-2-19 11 1 4-12 9-10 21 2 16 23 21 35 10 11-11 3-21 6-24 11-10 2-23-12-18z" fill="#ffc970"/><circle cx="30" cy="71" r="9" fill="#99633e"/><path d="M24 78l-6 9m9-3l-6 8M27 72L76 15m-5 0l-3-6m11 15l6 1" fill="none"/><path d="M15 54c-4 1-5 5-2 8" fill="none"/></>,
    comedy: <><circle cx="48" cy="47" r="33" fill="#ffcf66"/><path d="M23 39l12-7 9 7m9 0l10-7 11 7" fill="none"/><path d="M23 53c13 22 41 22 52-1z" fill="#62442e"/><path d="M28 55c14 5 27 5 42-1l-6 8H35z" fill="#fffaf0"/><path d="M17 45c-15 8-17 18-9 22 7 3 12-5 9-22zm63 0c14 7 17 16 9 20-8 4-13-6-9-20z" fill="#a4d3e5"/></>,
    arts: <><path d="M50 14C24 9 9 28 11 52c2 27 30 38 47 30 6-3 5-10-1-13-9-4-3-13 6-10 25 6 30-10 21-27-7-12-21-16-34-18z" fill="#e6b28b"/><circle cx="33" cy="28" r="5" fill="#e98886"/><circle cx="20" cy="44" r="5" fill="#b5cbb0"/><circle cx="26" cy="61" r="5" fill="#e7c662"/><circle cx="46" cy="27" r="5" fill="#b6a3df"/><circle cx="63" cy="34" r="5" fill="#a5d4e3"/></>,
    other: <><path d="M49 12l9 23 23 9-23 9-9 23-9-23-23-9 23-9z" fill="#ffc96e"/><path d="M77 68l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#c8b3ea"/><path d="M17 7l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#f1b8c8"/></>,
    binoculars: <><path d="M30 29l8-16 10 4-5 20m13-1l-1-20 12-3 7 19" fill="#bea7e4"/><path d="M24 28c15-6 25 4 24 20l-7 25-25-6 1-28zm43 0c-15-5-24 5-21 21l11 24 25-8-5-28z" fill="#ffd485"/><circle cx="26" cy="65" r="19" fill="#a9d5bf"/><circle cx="26" cy="65" r="12" fill="#b8a4df"/><circle cx="70" cy="63" r="19" fill="#b8a4df"/><circle cx="70" cy="63" r="12" fill="#a9d5bf"/><path d="M19 59l-3 9m49-11l-3 8" fill="none"/></>,
    phone: <><rect x="27" y="9" width="43" height="77" rx="10" fill="#c6ade8" transform="rotate(-8 48 48)"/><rect x="32" y="17" width="33" height="56" rx="4" fill="#fff5de" transform="rotate(-8 48 48)"/><path d="M35 44l13 13 31-34" stroke="#ffe0a0" strokeWidth="13" fill="none"/><path d="M35 44l13 13 31-34" strokeWidth="2" fill="none"/><path d="M40 79h9" fill="none"/></>,
  };
  return <svg className={`activity-art ${className}`} width={size} height={size} viewBox="0 0 96 100" fill="none" stroke="#38251d" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawings[type] || drawings.other}</svg>;
}

export function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="SquadIn home"><span className="brand-spark">✧</span>SquadIn<span className="brand-spark little">✦</span></button>;
}
export function Avatar({ user, size = 40, className = '' }) {
  return <span className={`avatar ${className}`} style={{ width: size, height: size }}><img src={user?.avatar} alt={user?.name || 'Member'} onError={e => { e.currentTarget.style.display = 'none'; }} /><span className="avatar-fallback">{(user?.name || 'S').slice(0, 1)}</span></span>;
}
export function AvatarStack({ ids = [], size = 30 }) {
  const { getUserById } = useApp();
  return <div className="avatar-stack">{ids.slice(0, 5).map(id => <Avatar key={id} user={getUserById(id)} size={size} />)}</div>;
}
export function SpotMeter({ filled, total }) {
  return <span className="spot-dots" aria-label={`${filled} of ${total} spots filled`}>{Array.from({ length: total }, (_, i) => <i key={i} className={i < filled ? 'filled' : ''} />)}</span>;
}
export function CityPicker({ value, onChange }) {
  const { selectedCity, setSelectedCity } = useApp();
  return <span className="city-picker"><MapPin size={15} fill="#f49d87" /><select aria-label="Your city" value={value || selectedCity} onChange={e => (onChange || setSelectedCity)(e.target.value)}>{INDIAN_CITIES.map(c => <option key={c.name}>{c.name}</option>)}</select><ChevronDown size={14} /></span>;
}
export function EmptyState({ title = 'No crews yet!', description = 'Explore plans or post your own. Your people are out there.', action, actionLabel = 'Explore weekend plans', art = 'binoculars' }) {
  return <div className="empty-state"><div className="empty-illustration"><span className="empty-orbit" /><ActivityArt type={art} size={112} /><span className="empty-star">✧</span></div><h3>{title}</h3><p>{description}</p>{action && <button className="button button-yellow" onClick={action}>{actionLabel}<span>↗</span></button>}</div>;
}
export function Sheet({ children, onClose, title, className = '' }) {
  const panel = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const handleKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const elements = panel.current?.querySelectorAll('button:not([disabled]), input, select, textarea, a[href], [tabindex="0"]');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, []);
  return <div className="sheet-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><section className={`sheet ${className}`} ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}><div className="sheet-handle" /><button className="icon-button sheet-close" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>{children}</section></div>;
}

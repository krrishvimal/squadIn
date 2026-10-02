import React from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Brand, Avatar } from './DesignKit';
import { NavigationTabs } from './BottomTabs';

export function Navbar() {
  const { currentUser, setActiveTab, setShowCreateModal, setShowGuidelinesModal, requireVerification } = useApp();
  return (
    <header className="app-header">
      <div className="navbar-inner">
        <Brand onClick={() => setActiveTab('explore')} />
        <NavigationTabs className="desktop-tabs" />
        <div className="header-actions">
          <button className="icon-button" onClick={() => setShowGuidelinesModal(true)} aria-label="Community safety guidelines">
            <ShieldCheck size={21} />
          </button>
          <button className="button button-yellow header-post" onClick={() => requireVerification(() => setShowCreateModal(true), 'create_plan')}>
            <Plus size={16} />Post Plan
          </button>
          <button className="profile-shortcut" onClick={() => setActiveTab('profile')} aria-label="Your profile">
            <Avatar user={currentUser} size={33} />
          </button>
        </div>
      </div>
    </header>
  );
}

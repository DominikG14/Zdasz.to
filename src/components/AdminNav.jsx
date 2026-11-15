import React from 'react';
import { IconShield, IconUser, IconBookOpen } from './Icons.jsx';

export default function AdminNav({ go, active }) {
  const tabs = [
    { id: 'overview', path: '/admin', label: 'Przegląd', icon: IconShield },
    { id: 'users', path: '/admin/users', label: 'Użytkownicy', icon: IconUser },
    { id: 'exercises', path: '/admin/exercises', label: 'Zadania CKE', icon: IconBookOpen },
  ];

  return (
    <nav className="admin-tabs-nav" aria-label="Nawigacja panelu administratora">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = active === tab.id;
        return (
          <a
            key={tab.id}
            href={tab.path}
            className={`admin-tab-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              go(tab.path);
            }}
          >
            <IconComponent size={16} />
            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

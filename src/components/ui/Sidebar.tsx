import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onClose, title, children }: SidebarProps) {
  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <h2>{title}</h2>
        <button className="sidebar-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="sidebar-content">{children}</div>
    </div>
  );
}


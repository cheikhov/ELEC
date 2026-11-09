/**
 * SMART ELEC — App & UI State Management
 *
 * Lightweight, reactive state store with localStorage persistence.
 * Zero external dependencies. Fully typed.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'projects'
  | 'wizard'
  | 'loads'
  | 'power_balance'
  | 'generator'
  | 'cable'
  | 'protection'
  | 'equipment'
  | 'reports';

export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeTab: NavigationTab;
  currentUser: User;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setCurrentUserRole: (role: UserRole) => void;
}

const DEFAULT_USER: User = {
  id: 'usr-eng-1',
  email: 'ingenieur@smartelec.dz',
  name: 'Ing. Amin Benali',
  role: 'engineer',
  organization: 'Bureau d\'Études Techniques Électriques (BETE Alger)',
  createdAt: '2026-01-01T08:00:00Z',
  lastLogin: new Date().toISOString(),
  preferences: {
    language: 'fr',
    theme: 'light',
  },
};

const AppContext = createContext<AppState>({
  theme: 'light',
  sidebarOpen: false,
  activeTab: 'dashboard',
  currentUser: DEFAULT_USER,
  toggleTheme: () => {},
  toggleSidebar: () => {},
  setSidebarOpen: () => {},
  setActiveTab: () => {},
  setCurrentUserRole: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('smart-elec-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTabState] = useState<NavigationTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    localStorage.setItem('smart-elec-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const setActiveTab = useCallback((tab: NavigationTab) => {
    setActiveTabState(tab);
    setSidebarOpen(false); // Close sidebar on mobile upon navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setCurrentUserRole = useCallback((role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
  }, []);

  const value: AppState = {
    theme,
    sidebarOpen,
    activeTab,
    currentUser,
    toggleTheme,
    toggleSidebar,
    setSidebarOpen,
    setActiveTab,
    setCurrentUserRole,
  };

  return React.createElement(AppContext.Provider, { value }, children);
};

export function useApp() {
  return useContext(AppContext);
}


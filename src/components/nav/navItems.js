import { Home, FolderLock, Sparkles, Route, Scale, Users, Utensils, ShieldAlert, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', key: 'nav.home', icon: Home, primary: true },
  { to: '/documents', key: 'nav.documents', icon: FolderLock, primary: true },
  { to: '/assistant', key: 'nav.assistant', icon: Sparkles, primary: true },
  { to: '/camino', key: 'nav.camino', icon: Route, primary: true },
  { to: '/legal', key: 'nav.legal', icon: Scale, primary: false },
  { to: '/community', key: 'nav.community', icon: Users, primary: false },
  { to: '/food', key: 'nav.food', icon: Utensils, primary: false },
  { to: '/emergency', key: 'nav.emergency', icon: ShieldAlert, primary: false },
  { to: '/settings', key: 'nav.settings', icon: Settings, primary: false },
];
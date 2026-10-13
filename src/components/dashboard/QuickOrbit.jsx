import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Scale, ShieldAlert } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import Speakable from '@/components/common/Speakable';

export default function QuickOrbit({ children }) {
  const { t } = usePrefs();

  const bubbles = [
    { to: '/documents', icon: Upload, label: t('dash.uploadDoc'), className: 'rt-bub rt-b1' },
    { to: '/assistant', icon: Sparkles, label: t('dash.askLuz'), className: 'rt-bub rt-b2' },
    { to: '/legal', icon: Scale, label: t('dash.findHelp'), className: 'rt-bub rt-b3' },
    { to: '/emergency?mode=1', icon: ShieldAlert, label: t('dash.emergencyMode'), className: 'rt-bub rt-b4' },
  ];

  return (
    <Speakable as="section" className="rt-quick-section" listenClassName="rt-listen" aria-labelledby="quick-title">
      <h2 id="quick-title" className="rt-quick">
        {t('dash.quickTitle')}
      </h2>
      <div className="rt-orbit">
        <div className="rt-ring" aria-hidden="true" />
        {children}
        {bubbles.map(({ to, icon: Icon, label, className }) => (
          <Link key={to} to={to} className={className}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </Speakable>
  );
}
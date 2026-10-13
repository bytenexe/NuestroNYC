import React from 'react';
import { Outlet } from 'react-router-dom';
import { usePrefs } from '@/lib/PreferencesContext';
import SideNav from '@/components/nav/SideNav';
import MobileNav from '@/components/nav/MobileNav';
import TopBar from '@/components/nav/TopBar';
import FlagBanner from '@/components/common/FlagBanner';
import PageReader from '@/components/common/PageReader';

export default function Layout() {
  const { t } = usePrefs();

  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="r-skip-link">
        {t('a11y.skip')}
      </a>
      <SideNav />
      <div className="lg:pl-[272px]">
        <FlagBanner />
        <TopBar />
        <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 lg:pb-16 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <PageReader />
      <MobileNav />
    </div>
  );
}
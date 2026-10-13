import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import PageHeader from '@/components/common/PageHeader';
import ProfileCard from '@/components/settings/ProfileCard';
import LanguageCard from '@/components/settings/LanguageCard';
import AccessibilityPanel from '@/components/settings/AccessibilityPanel';
import FamilyCodeCard from '@/components/settings/FamilyCodeCard';
import FamilyWorkspaceCard from '@/components/settings/FamilyWorkspaceCard';
import SignOutCard from '@/components/settings/SignOutCard';

export default function Settings() {
  const { t } = usePrefs();
  const { isAuthenticated } = useAccountAction();

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} icon={SettingsIcon} />
      <div className="space-y-5">
        <ProfileCard />
        <LanguageCard />
        <AccessibilityPanel />
        <FamilyWorkspaceCard />
        <FamilyCodeCard />
        {isAuthenticated ? <SignOutCard /> : null}
      </div>
    </div>
  );
}
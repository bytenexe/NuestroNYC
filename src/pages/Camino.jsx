import React, { useCallback, useEffect, useState } from 'react';
import { Route, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import { tLabel } from '@/lib/constants';
import PageHeader from '@/components/common/PageHeader';
import MilestoneItem from '@/components/camino/MilestoneItem';
import MilestoneDialog from '@/components/camino/MilestoneDialog';
import TemplatesCard from '@/components/camino/TemplatesCard';
import FamilyLockBanner from '@/components/common/FamilyLockBanner';
import { useFamilyAccess } from '@/lib/familyAccess';
import ProgressRing from '@/components/common/ProgressRing';
import { Button } from '@/components/ui/button';

export default function Camino() {
  const { t, prefs } = usePrefs();
  const code = prefs.householdCode;
  const { isAuthenticated, whenSignedIn } = useAccountAction();
  const { visible, hidden } = useFamilyAccess();
  const [milestones, setMilestones] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setMilestones([]);
      return;
    }
    const page = await base44.entities.JourneyMilestone.filter(
      { $or: [{ household_code: code }, { shared: true }] },
      { sort: 'order_index', limit: 100 }
    );
    setMilestones(page.items);
  }, [code, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => whenSignedIn(() => setDialogOpen(true));

  const useTemplate = (template) => {
    whenSignedIn(async () => {
      const start = milestones?.length || 0;
      await base44.entities.JourneyMilestone.bulkCreate(
        template.milestones.map((step, index) => ({
          household_code: code,
          title: tLabel(step, prefs.contentLang),
          stage: step.stage,
          status: 'pending',
          order_index: start + index,
        }))
      );
      load();
    });
  };

  const total = milestones?.length || 0;
  const done = (milestones || []).filter((m) => m.status === 'done').length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const upcoming = (milestones || []).filter((m) => m.status !== 'done').slice(0, 3);

  return (
    <div>
      <PageHeader
        title={t('camino.title')}
        subtitle={t('camino.subtitle')}
        icon={Route}
        actions={
          <Button onClick={openAdd} className="r-tap gap-2 bg-[hsl(var(--brand-navy))] text-base">
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('camino.addStep')}
          </Button>
        }
      />

      <FamilyLockBanner count={hidden(milestones || []).length} />

      {milestones === null ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="r-card-lg flex flex-col items-center gap-5 sm:flex-row">
            <ProgressRing value={percent} size={128} stroke={12}>
              <span className="font-heading text-3xl font-extrabold text-[hsl(var(--brand-navy))]">{percent}%</span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{t('camino.progress')}</span>
            </ProgressRing>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">{t('camino.progress')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {done}/{total} {t('camino.steps')}
              </p>
              {upcoming.length ? (
                <>
                  <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-[hsl(var(--brand-teal))]">
                    {t('camino.nextTitle')}
                  </h3>
                  <ul className="mt-1 space-y-1 text-sm">
                    {upcoming.map((step) => (
                      <li key={step.id}>• {step.title}</li>
                    ))}
                  </ul>
                </>
              ) : total ? (
                <p className="mt-3 text-sm font-semibold text-[hsl(var(--brand-teal))]">{t('common.completed')} 🎉</p>
              ) : null}
            </div>
          </section>

          <TemplatesCard onUse={useTemplate} defaultOpen={total === 0} />

          {total ? (
            <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[26px] before:top-4 before:w-0.5 before:bg-border">
              {visible(milestones).map((milestone, index) => (
                <MilestoneItem key={milestone.id} milestone={milestone} index={index} onChanged={load} />
              ))}
            </ol>
          ) : (
            <div className="r-card text-center">
              <h2 className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">{t('camino.empty')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('camino.emptyHelp')}</p>
              <Button onClick={openAdd} className="r-tap mt-4 gap-2 bg-[hsl(var(--brand-navy))]">
                <Plus className="h-4 w-4" aria-hidden="true" /> {t('camino.addStep')}
              </Button>
            </div>
          )}
        </div>
      )}

      <MilestoneDialog open={dialogOpen} onOpenChange={setDialogOpen} nextIndex={total} onCreated={load} />
    </div>
  );
}
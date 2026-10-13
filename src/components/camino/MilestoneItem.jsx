import React from 'react';
import { Check, Play, RotateCcw, Trash2, CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { formatDate } from '@/lib/readiness';
import ShareToggle from '@/components/common/ShareToggle';
import Speakable from '@/components/common/Speakable';

const STATUS_STYLE = {
  done: 'bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]',
  in_progress: 'bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]',
  pending: 'bg-muted text-muted-foreground',
};

export default function MilestoneItem({ milestone, index, onChanged }) {
  const { t, prefs } = usePrefs();
  const isDone = milestone.status === 'done';

  const setStatus = async (status) => {
    await base44.entities.JourneyMilestone.update(milestone.id, {
      status,
      ...(status === 'done' ? { completed_date: new Date().toISOString().slice(0, 10) } : {}),
    });
    onChanged();
  };

  const remove = async () => {
    await base44.entities.JourneyMilestone.delete(milestone.id);
    onChanged();
  };

  return (
    <li className="relative pl-12">
      <span
        aria-hidden="true"
        className={`absolute left-[13px] top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 ${
          isDone
            ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))] text-white'
            : milestone.status === 'in_progress'
            ? 'border-[hsl(var(--brand-orange))] bg-card text-[hsl(var(--brand-orange))] font-bold'
            : 'border-border bg-card text-muted-foreground'
        }`}
      >
        {isDone ? <Check className="h-4 w-4" /> : milestone.status === 'in_progress' ? '•' : index + 1}
      </span>

      <Speakable className="r-card">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className={`font-heading text-base font-bold ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {milestone.title}
          </h3>
          <span className={`r-chip ${STATUS_STYLE[milestone.status] || STATUS_STYLE.pending}`}>
            {milestone.status === 'done'
              ? t('common.completed')
              : milestone.status === 'in_progress'
              ? t('common.inProgress')
              : t('common.pending')}
          </span>
        </div>

        <p className="mt-1 text-xs font-semibold text-[hsl(var(--brand-teal))]">{t(`stage.${milestone.stage}`)}</p>

        {milestone.target_date ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {t('camino.targetDate')}: {formatDate(milestone.target_date, prefs.lang)}
          </p>
        ) : null}

        {milestone.completed_date ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {t('camino.completedOn')} {formatDate(milestone.completed_date, prefs.lang)}
          </p>
        ) : null}

        {milestone.notes ? <p className="mt-2 text-sm text-muted-foreground">{milestone.notes}</p> : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {!isDone ? (
            <button
              type="button"
              onClick={() => setStatus('done')}
              className="r-chip border border-[hsl(var(--brand-teal))] bg-card text-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal-soft))]"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" /> {t('camino.markDone')}
            </button>
          ) : null}
          {milestone.status !== 'in_progress' && !isDone ? (
            <button
              type="button"
              onClick={() => setStatus('in_progress')}
              className="r-chip border border-border bg-card hover:bg-secondary"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" /> {t('camino.markInProgress')}
            </button>
          ) : null}
          {isDone || milestone.status === 'in_progress' ? (
            <button type="button" onClick={() => setStatus('pending')} className="r-chip border border-border bg-card hover:bg-secondary">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t('camino.reopen')}
            </button>
          ) : null}
          <ShareToggle entity="JourneyMilestone" record={milestone} onChanged={onChanged} />
          <button
            type="button"
            onClick={remove}
            className="r-chip border border-border bg-card text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.delete')}
          </button>
        </div>
      </Speakable>
    </li>
  );
}
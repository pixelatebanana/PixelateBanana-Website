import { STAGES, type Stage } from '@/lib/crm/shared';

export default function StageTracker({ stage }: { stage: Stage }) {
  const at = STAGES.findIndex((s) => s.key === stage);
  return (
    <ol className="crm-stages" aria-label="Project progress">
      {STAGES.map((s, i) => <li key={s.key} className={i < at ? 'done' : i === at ? 'now' : ''} aria-current={i === at ? 'step' : undefined}>{i < at ? '✓ ' : ''}{s.label}</li>)}
    </ol>
  );
}

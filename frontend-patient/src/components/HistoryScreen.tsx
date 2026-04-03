import { useEffect, useMemo, useState } from 'react';
import { ConsultationStatus } from './StatusScreen';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export interface StoredConsultationSummary {
  id: string;
  patientId: string;
  chiefComplaint: string;
  provinceCode: string;
  submittedAt: string;
}

interface HistoryScreenProps {
  patientId: string;
  onBack: () => void;
  onOpenConsultation: (consultationId: string) => void;
}

const TEXT = {
  title: '\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e04\u0e33\u0e02\u0e2d',
  subtitle: '\u0e14\u0e39\u0e04\u0e33\u0e02\u0e2d\u0e22\u0e49\u0e2d\u0e19\u0e2b\u0e25\u0e31\u0e07\u0e41\u0e25\u0e30\u0e01\u0e14\u0e40\u0e02\u0e49\u0e32\u0e14\u0e39\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e41\u0e15\u0e48\u0e25\u0e30\u0e40\u0e04\u0e2a',
  back: '\u0e01\u0e25\u0e31\u0e1a',
  open: '\u0e14\u0e39\u0e2a\u0e16\u0e32\u0e19\u0e30',
  loading: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14...',
  empty: '\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e04\u0e33\u0e02\u0e2d',
  refresh: '\u0e23\u0e35\u0e40\u0e1f\u0e23\u0e0a',
  unknown: '\u0e44\u0e21\u0e48\u0e23\u0e30\u0e1a\u0e38',
  failed: '\u0e42\u0e2b\u0e25\u0e14\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e1a\u0e32\u0e07\u0e40\u0e04\u0e2a\u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08'
} as const;

const STATUS_LABELS: Record<ConsultationStatus['status'], string> = {
  submitted: '\u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d\u0e41\u0e25\u0e49\u0e27',
  triaged: '\u0e1b\u0e23\u0e30\u0e40\u0e21\u0e34\u0e19\u0e41\u0e25\u0e49\u0e27',
  in_review: '\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e01\u0e33\u0e25\u0e31\u0e07\u0e15\u0e23\u0e27\u0e08',
  awaiting_patient: '\u0e23\u0e2d\u0e15\u0e2d\u0e1a\u0e04\u0e33\u0e16\u0e32\u0e21',
  completed: '\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19',
  escalated: '\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e41\u0e25\u0e49\u0e27'
};

function historyKey(patientId: string) {
  return `patient-history:${patientId}`;
}

export function saveConsultationHistoryItem(item: StoredConsultationSummary) {
  const items = loadConsultationHistory(patientIdOrFallback(item.patientId));
  const nextItems = [item, ...items.filter((entry) => entry.id !== item.id)].slice(0, 20);
  localStorage.setItem(historyKey(patientIdOrFallback(item.patientId)), JSON.stringify(nextItems));
}

export function loadConsultationHistory(patientId: string): StoredConsultationSummary[] {
  try {
    const raw = localStorage.getItem(historyKey(patientIdOrFallback(patientId)));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function patientIdOrFallback(patientId: string) {
  return patientId || 'anonymous';
}

function formatThaiDate(value: string) {
  return new Date(value).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function HistoryScreen({ patientId, onBack, onOpenConsultation }: HistoryScreenProps) {
  const summaries = useMemo(() => loadConsultationHistory(patientId), [patientId]);
  const [consultations, setConsultations] = useState<Record<string, ConsultationStatus>>({});
  const [loading, setLoading] = useState(true);
  const [hasPartialError, setHasPartialError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      if (summaries.length === 0) {
        setLoading(false);
        setHasPartialError(false);
        return;
      }

      setLoading(true);
      setHasPartialError(false);

      const results = await Promise.all(
        summaries.map(async (summary) => {
          try {
            const response = await fetch(`${API_BASE}/api/v1/consultations/${summary.id}`);
            if (!response.ok) {
              throw new Error(String(response.status));
            }
            const item = (await response.json()) as ConsultationStatus;
            return [summary.id, item] as const;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      const next: Record<string, ConsultationStatus> = {};
      let partialError = false;
      for (const result of results) {
        if (!result) {
          partialError = true;
          continue;
        }
        next[result[0]] = result[1];
      }

      setConsultations(next);
      setHasPartialError(partialError);
      setLoading(false);
    }

    loadItems();
    return () => {
      cancelled = true;
    };
  }, [summaries]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-ink to-brand-navy px-4 py-4">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between text-white">
          <button onClick={onBack} className="rounded-full bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/20">
            {TEXT.back}
          </button>
          <div className="text-sm font-medium text-white/80">{TEXT.title}</div>
          <button onClick={() => window.location.reload()} className="rounded-full bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/20">
            {TEXT.refresh}
          </button>
        </header>

        <section className="rounded-3xl bg-white/10 p-5 backdrop-blur text-white">
          <h1 className="text-xl font-semibold">{TEXT.title}</h1>
          <p className="mt-2 text-sm text-white/70">{TEXT.subtitle}</p>
        </section>

        {loading ? (
          <section className="rounded-3xl bg-white/10 p-6 text-center text-white">{TEXT.loading}</section>
        ) : summaries.length === 0 ? (
          <section className="rounded-3xl bg-white/10 p-6 text-center text-white/75">{TEXT.empty}</section>
        ) : (
          <div className="space-y-3">
            {hasPartialError && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {TEXT.failed}
              </div>
            )}
            {summaries.map((summary) => {
              const consultation = consultations[summary.id];
              const statusLabel = consultation ? STATUS_LABELS[consultation.status] : TEXT.unknown;
              const submittedAt = consultation?.submittedAt ?? summary.submittedAt;
              const chiefComplaint = consultation?.chiefComplaint ?? summary.chiefComplaint;

              return (
                <section key={summary.id} className="rounded-3xl bg-white/10 p-4 backdrop-blur text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-white/55">{summary.id.slice(0, 8).toUpperCase()}</div>
                      <div className="mt-2 text-base font-medium leading-6">{chiefComplaint}</div>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs">{statusLabel}</div>
                  </div>
                  <div className="mt-3 text-sm text-white/65">{formatThaiDate(submittedAt)}</div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-white/60">{summary.provinceCode}</div>
                    <button
                      onClick={() => onOpenConsultation(summary.id)}
                      className="rounded-2xl bg-brand-leaf px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-leaf/80"
                    >
                      {TEXT.open}
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

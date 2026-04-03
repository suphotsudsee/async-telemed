import { useEffect, useState } from 'react';
import { ConsultationData } from './ConsultationForm';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const TEXT = {
  loading: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14...',
  notFound: '\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e04\u0e33\u0e02\u0e2d',
  back: '\u0e01\u0e25\u0e31\u0e1a',
  title: '\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e04\u0e33\u0e02\u0e2d',
  urgency: '\u0e04\u0e30\u0e41\u0e19\u0e19\u0e04\u0e27\u0e32\u0e21\u0e40\u0e23\u0e48\u0e07\u0e14\u0e48\u0e27\u0e19',
  queue: '\u0e04\u0e27\u0e32\u0e21\u0e04\u0e37\u0e1a\u0e2b\u0e19\u0e49\u0e32',
  details: '\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14',
  complaint: '\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e2b\u0e25\u0e31\u0e01',
  duration: '\u0e23\u0e30\u0e22\u0e30\u0e40\u0e27\u0e25\u0e32',
  days: '\u0e27\u0e31\u0e19',
  risk: '\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e40\u0e15\u0e37\u0e2d\u0e19',
  images: '\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e',
  firstDue: '\u0e01\u0e33\u0e2b\u0e19\u0e14\u0e15\u0e2d\u0e1a\u0e01\u0e25\u0e31\u0e1a\u0e04\u0e23\u0e31\u0e49\u0e07\u0e41\u0e23\u0e01',
  completeDue: '\u0e01\u0e33\u0e2b\u0e19\u0e14\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19',
  refresh: '\u0e23\u0e35\u0e40\u0e1f\u0e23\u0e0a\u0e2a\u0e16\u0e32\u0e19\u0e30',
  diagnosis: '\u0e04\u0e33\u0e27\u0e34\u0e19\u0e34\u0e08\u0e09\u0e31\u0e22',
  advice: '\u0e04\u0e33\u0e41\u0e19\u0e30\u0e19\u0e33',
  prescription: '\u0e22\u0e32\u0e17\u0e35\u0e48\u0e2a\u0e31\u0e48\u0e07',
  home: '\u0e01\u0e25\u0e31\u0e1a\u0e2b\u0e19\u0e49\u0e32\u0e2b\u0e25\u0e31\u0e01',
  escalatedTitle: '\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e01\u0e32\u0e23\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d',
  escalatedMessage: '\u0e40\u0e04\u0e2a\u0e19\u0e35\u0e49\u0e16\u0e39\u0e01\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e43\u0e2b\u0e49\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e2b\u0e23\u0e37\u0e2d\u0e17\u0e35\u0e21\u0e17\u0e35\u0e48\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e02\u0e49\u0e2d\u0e07\u0e41\u0e25\u0e49\u0e27 \u0e42\u0e1b\u0e23\u0e14\u0e23\u0e2d\u0e01\u0e32\u0e23\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e01\u0e25\u0e31\u0e1a\u0e08\u0e32\u0e01\u0e17\u0e35\u0e21\u0e23\u0e31\u0e01\u0e29\u0e32'
} as const;

export interface ConsultationStatus {
  id: string;
  patientId: string;
  provinceCode: string;
  specialty: string;
  status: 'submitted' | 'triaged' | 'in_review' | 'awaiting_patient' | 'completed' | 'escalated';
  priorityScore: number;
  chiefComplaint: string;
  symptomDurationDays: number;
  redFlags: string[];
  imageUrls: string[];
  submittedAt: string;
  firstResponseDueAt: string;
  completionDueAt: string;
  assignedDoctorId?: string;
  diagnosis?: string;
  advice?: string;
  prescriptionItems?: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
  }>;
}

interface StatusScreenProps {
  consultationId: string;
  onBack: () => void;
  data?: ConsultationData;
}

const STATUS_META: Record<ConsultationStatus['status'], { label: string; short: string; tone: string }> = {
  submitted: {
    label: '\u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d\u0e41\u0e25\u0e49\u0e27',
    short: '01',
    tone: 'bg-blue-500/20 text-blue-100 border-blue-400/30'
  },
  triaged: {
    label: '\u0e1b\u0e23\u0e30\u0e40\u0e21\u0e34\u0e19\u0e41\u0e25\u0e49\u0e27',
    short: '02',
    tone: 'bg-amber-500/20 text-amber-100 border-amber-400/30'
  },
  in_review: {
    label: '\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e01\u0e33\u0e25\u0e31\u0e07\u0e15\u0e23\u0e27\u0e08',
    short: '03',
    tone: 'bg-orange-500/20 text-orange-100 border-orange-400/30'
  },
  awaiting_patient: {
    label: '\u0e23\u0e2d\u0e15\u0e2d\u0e1a\u0e04\u0e33\u0e16\u0e32\u0e21',
    short: '04',
    tone: 'bg-violet-500/20 text-violet-100 border-violet-400/30'
  },
  completed: {
    label: '\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19',
    short: '05',
    tone: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
  },
  escalated: {
    label: '\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e41\u0e25\u0e49\u0e27',
    short: '!!',
    tone: 'bg-rose-500/20 text-rose-100 border-rose-400/30'
  }
};

const STATUS_ORDER: ConsultationStatus['status'][] = [
  'submitted',
  'triaged',
  'in_review',
  'awaiting_patient',
  'completed'
];

function buildFallbackConsultation(consultationId: string, data: ConsultationData): ConsultationStatus {
  return {
    id: consultationId,
    patientId: data.patientId,
    provinceCode: data.provinceCode,
    specialty: 'dermatology',
    status: 'submitted',
    priorityScore: 50,
    chiefComplaint: data.chiefComplaint,
    symptomDurationDays: data.symptomDurationDays,
    redFlags: data.redFlags,
    imageUrls: data.imageUrls,
    submittedAt: new Date().toISOString(),
    firstResponseDueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    completionDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
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

export default function StatusScreen({ consultationId, onBack, data }: StatusScreenProps) {
  const [consultation, setConsultation] = useState<ConsultationStatus | null>(
    data?.chiefComplaint ? buildFallbackConsultation(consultationId, data) : null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (data?.chiefComplaint) {
      setConsultation(buildFallbackConsultation(consultationId, data));
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
    }

    const fetchConsultation = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/consultations/${consultationId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const nextConsultation = (await response.json()) as ConsultationStatus;
        if (cancelled) return;

        setConsultation(nextConsultation);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (!consultation) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchConsultation();
    const interval = setInterval(fetchConsultation, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [consultationId, data, refreshKey]);

  if (loading && !consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-dark to-brand-navy flex items-center justify-center">
        <div className="text-white text-lg">{TEXT.loading}</div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-dark to-brand-navy flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white/10 p-6 text-center text-white">
          <div className="mb-3 text-lg text-red-300">{error || TEXT.notFound}</div>
          <button onClick={onBack} className="rounded-2xl bg-brand-leaf px-5 py-2.5 font-medium text-white">
            {TEXT.home}
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(consultation.status);
  const statusMeta = STATUS_META[consultation.status] ?? STATUS_META.submitted;

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-ink to-brand-navy px-4 py-4">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between text-white">
          <button onClick={onBack} className="rounded-full bg-white/10 px-3 py-2 text-sm hover:bg-white/20 transition-colors">
            {TEXT.back}
          </button>
          <div className="text-sm font-medium text-white/80">{TEXT.title}</div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              setRefreshKey((value) => value + 1);
            }}
            className="rounded-full bg-white/10 px-3 py-2 text-sm hover:bg-white/20 transition-colors"
          >
            {TEXT.refresh}
          </button>
        </header>

        <section className="rounded-3xl bg-white/10 p-5 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-semibold ${statusMeta.tone}`}>
              {statusMeta.short}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white/60">{consultationId.slice(0, 8).toUpperCase()}</div>
              <h1 className="mt-1 text-xl font-semibold text-white">{statusMeta.label}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-white/75">
                <span className="rounded-full bg-white/10 px-3 py-1">{TEXT.urgency}: {consultation.priorityScore}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">{formatThaiDate(consultation.submittedAt)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white/10 p-4 backdrop-blur">
          <div className="mb-3 text-sm font-medium text-white/80">{TEXT.queue}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {STATUS_ORDER.map((status, index) => {
              const item = STATUS_META[status];
              const active = index <= currentStatusIndex;
              const current = index === currentStatusIndex;

              return (
                <div
                  key={status}
                  className={`rounded-2xl border px-3 py-3 text-center text-sm ${
                    active
                      ? 'border-brand-leaf/40 bg-brand-leaf/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/45'
                  } ${current ? 'ring-1 ring-brand-leaf/70' : ''}`}
                >
                  <div className="text-xs font-semibold opacity-80">{item.short}</div>
                  <div className="mt-1 leading-5">{item.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-white/10 p-4 backdrop-blur text-white">
          <div className="mb-3 text-sm font-medium text-white/80">{TEXT.details}</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-white/55">{TEXT.complaint}</span>
              <span className="max-w-[65%] text-right leading-5">{consultation.chiefComplaint}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/55">{TEXT.duration}</span>
              <span>{consultation.symptomDurationDays} {TEXT.days}</span>
            </div>
            {consultation.redFlags.length > 0 && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-white/55">{TEXT.risk}</span>
                <span className="max-w-[65%] text-right text-amber-300 leading-5">{consultation.redFlags.join(', ')}</span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2 rounded-2xl bg-white/5 p-3 text-xs text-white/65 sm:grid-cols-2">
              <div>{TEXT.firstDue}: {formatThaiDate(consultation.firstResponseDueAt)}</div>
              <div>{TEXT.completeDue}: {formatThaiDate(consultation.completionDueAt)}</div>
            </div>
          </div>
        </section>

        {consultation.imageUrls.length > 0 && (
          <section className="rounded-3xl bg-white/10 p-4 backdrop-blur text-white">
            <div className="mb-3 text-sm font-medium text-white/80">{TEXT.images}</div>
            <div className="grid grid-cols-3 gap-2">
              {consultation.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`image-${index + 1}`}
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {consultation.status === 'escalated' && (
          <section className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-4 text-white backdrop-blur">
            <div className="mb-3 text-sm font-medium text-rose-200">{TEXT.escalatedTitle}</div>
            <div className="space-y-3 text-sm leading-6">
              <div>{consultation.advice || TEXT.escalatedMessage}</div>
              {consultation.diagnosis && (
                <div>
                  <div className="text-white/55">{TEXT.diagnosis}</div>
                  <div>{consultation.diagnosis}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {consultation.status === 'completed' && consultation.diagnosis && (
          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-white backdrop-blur">
            <div className="mb-3 text-sm font-medium text-emerald-200">{TEXT.diagnosis}</div>
            <div className="space-y-3 text-sm leading-6">
              <div>
                <div className="text-white/55">{TEXT.diagnosis}</div>
                <div>{consultation.diagnosis}</div>
              </div>
              {consultation.advice && (
                <div>
                  <div className="text-white/55">{TEXT.advice}</div>
                  <div>{consultation.advice}</div>
                </div>
              )}
              {consultation.prescriptionItems && consultation.prescriptionItems.length > 0 && (
                <div>
                  <div className="text-white/55">{TEXT.prescription}</div>
                  <div className="mt-1 space-y-1">
                    {consultation.prescriptionItems.map((item, index) => (
                      <div key={index} className="rounded-2xl bg-white/5 px-3 py-2">
                        {item.medicationName} {item.dosage} | {item.frequency} | {item.durationDays} {TEXT.days}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

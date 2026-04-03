import { ConsultationData } from './ConsultationForm';

interface ResultScreenProps {
  consultationId: string;
  data: ConsultationData;
  onNewConsultation: () => void;
  onViewStatus: () => void;
  onViewHistory: () => void;
}

const TEXT = {
  success: '\u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d\u0e1b\u0e23\u0e36\u0e01\u0e29\u0e32\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08!',
  intro: '\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e08\u0e30\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e01\u0e25\u0e31\u0e1a\u0e20\u0e32\u0e22\u0e43\u0e19 4 \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07',
  requestId: '\u0e2b\u0e21\u0e32\u0e22\u0e40\u0e25\u0e02\u0e04\u0e33\u0e02\u0e2d',
  progress: '\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e01\u0e32\u0e23\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23',
  sent: '\u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d',
  triaged: '\u0e08\u0e31\u0e14\u0e04\u0e34\u0e27',
  review: '\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e15\u0e23\u0e27\u0e08',
  done: '\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19',
  active: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23',
  summary: '\u0e2a\u0e23\u0e38\u0e1b\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e17\u0e35\u0e48\u0e2a\u0e48\u0e07',
  complaint: '\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e2b\u0e25\u0e31\u0e01',
  duration: '\u0e23\u0e30\u0e22\u0e30\u0e40\u0e27\u0e25\u0e32',
  images: '\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e',
  days: '\u0e27\u0e31\u0e19',
  items: '\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23',
  nextTitle: '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e16\u0e31\u0e14\u0e44\u0e1b',
  nextOne: '\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e08\u0e30\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e41\u0e25\u0e30\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e\u0e17\u0e35\u0e48\u0e2a\u0e48\u0e07\u0e21\u0e32',
  nextTwo: '\u0e04\u0e38\u0e13\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e01\u0e14\u0e14\u0e39\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e44\u0e14\u0e49\u0e17\u0e31\u0e19\u0e17\u0e35\u0e08\u0e32\u0e01\u0e1b\u0e38\u0e48\u0e21\u0e14\u0e49\u0e32\u0e19\u0e25\u0e48\u0e32\u0e07',
  nextThree: '\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e15\u0e2d\u0e1a\u0e01\u0e25\u0e31\u0e1a \u0e08\u0e30\u0e40\u0e2b\u0e47\u0e19\u0e1c\u0e25\u0e27\u0e34\u0e19\u0e34\u0e08\u0e09\u0e31\u0e22 \u0e04\u0e33\u0e41\u0e19\u0e30\u0e19\u0e33 \u0e41\u0e25\u0e30\u0e22\u0e32\u0e17\u0e35\u0e48\u0e2a\u0e31\u0e48\u0e07',
  viewStatus: '\ud83d\udcca \u0e14\u0e39\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e04\u0e33\u0e02\u0e2d',
  viewHistory: '\ud83d\udcd6 \u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e04\u0e33\u0e02\u0e2d',
  newRequest: '\u2795 \u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d\u0e43\u0e2b\u0e21\u0e48',
  unspecified: '\u0e44\u0e21\u0e48\u0e23\u0e30\u0e1a\u0e38'
} as const;

const STATUS_STEPS = [
  { id: 'submitted', label: TEXT.sent, icon: '01' },
  { id: 'triaged', label: TEXT.triaged, icon: '02' },
  { id: 'in_review', label: TEXT.review, icon: '03' },
  { id: 'completed', label: TEXT.done, icon: '04' }
];

export default function ResultScreen({ consultationId, data, onNewConsultation, onViewStatus, onViewHistory }: ResultScreenProps) {
  const chiefComplaint = data?.chiefComplaint ?? TEXT.unspecified;
  const symptomDurationDays = data?.symptomDurationDays ?? 0;
  const imageUrls = data?.imageUrls ?? [];
  const redFlags = data?.redFlags ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-ink to-brand-navy px-4 py-6">
      <div className="mx-auto max-w-md">
        <section className="mb-6 text-center">
          <div className="mb-4 text-5xl">OK</div>
          <h1 className="mb-2 text-2xl font-bold text-white">{TEXT.success}</h1>
          <p className="text-white/70">{TEXT.intro}</p>
        </section>

        <section className="mb-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
          <div className="mb-1 text-sm text-white/60">{TEXT.requestId}</div>
          <div className="font-mono text-lg text-white">{consultationId.slice(0, 8).toUpperCase()}</div>
        </section>

        <section className="mb-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
          <h2 className="mb-4 font-medium text-white">{TEXT.progress}</h2>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${index === 0 ? 'bg-brand-leaf text-white' : 'bg-white/20 text-white/50'}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${index === 0 ? 'text-white' : 'text-white/50'}`}>{step.label}</div>
                  {index === 0 && <div className="text-sm text-brand-leaf">{TEXT.active}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
          <h2 className="mb-4 font-medium text-white">{TEXT.summary}</h2>
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex justify-between gap-4">
              <span className="text-white/50">{TEXT.complaint}</span>
              <span className="max-w-48 text-right">{chiefComplaint}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/50">{TEXT.duration}</span>
              <span>{symptomDurationDays} {TEXT.days}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/50">{TEXT.images}</span>
              <span>{imageUrls.length} {TEXT.images}</span>
            </div>
            {redFlags.length > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-white/50">{TEXT.nextTitle}</span>
                <span className="text-right text-red-300">{redFlags.length} {TEXT.items}</span>
              </div>
            )}
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-brand-leaf/20 p-6 backdrop-blur">
          <h2 className="mb-3 font-medium text-white">{TEXT.nextTitle}</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>1. {TEXT.nextOne}</li>
            <li>2. {TEXT.nextTwo}</li>
            <li>3. {TEXT.nextThree}</li>
          </ul>
        </section>

        <div className="space-y-3">
          <button onClick={onViewStatus} className="w-full rounded-2xl bg-white/10 py-3 font-medium text-white transition-colors hover:bg-white/20">
            {TEXT.viewStatus}
          </button>
          <button onClick={onViewHistory} className="w-full rounded-2xl bg-white/10 py-3 font-medium text-white transition-colors hover:bg-white/20">
            {TEXT.viewHistory}
          </button>
          <button onClick={onNewConsultation} className="w-full rounded-2xl bg-brand-leaf py-3 font-medium text-white transition-colors hover:bg-brand-leaf/80">
            {TEXT.newRequest}
          </button>
        </div>
      </div>
    </main>
  );
}

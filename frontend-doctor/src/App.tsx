import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const SESSION_KEY = 'doctor_session';
const QUEUE_REFRESH_INTERVAL_MS = 10000;

const TEXT = {
  loading: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14\u0e04\u0e34\u0e27\u0e07\u0e32\u0e19...',
  apiError: '\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e08\u0e23\u0e34\u0e07\u0e08\u0e32\u0e01 Patient App \u0e44\u0e14\u0e49',
  loginTitle: '\u0e40\u0e02\u0e49\u0e32\u0e2a\u0e39\u0e48\u0e23\u0e30\u0e1a\u0e1a\u0e41\u0e1e\u0e17\u0e22\u0e4c',
  loginSubtitle: '\u0e40\u0e02\u0e49\u0e32\u0e14\u0e49\u0e27\u0e22\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e2b\u0e21\u0e2d\u0e41\u0e25\u0e30\u0e23\u0e2b\u0e31\u0e2a\u0e1c\u0e48\u0e32\u0e19\u0e17\u0e35\u0e48\u0e2d\u0e2d\u0e01\u0e43\u0e2b\u0e49\u0e08\u0e23\u0e34\u0e07',
  loginButton: '\u0e40\u0e02\u0e49\u0e32\u0e17\u0e33\u0e07\u0e32\u0e19',
  loginFail: '\u0e0a\u0e37\u0e48\u0e2d\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e2b\u0e23\u0e37\u0e2d\u0e23\u0e2b\u0e31\u0e2a\u0e1c\u0e48\u0e32\u0e19\u0e44\u0e21\u0e48\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07',
  usernameLabel: 'Username',
  passwordLabel: '\u0e23\u0e2b\u0e31\u0e2a\u0e1c\u0e48\u0e32\u0e19',
  demoHint: 'dr.narin / doctor123, dr.pim / doctor123',
  queueTitle: '\u0e04\u0e34\u0e27\u0e04\u0e19\u0e44\u0e02\u0e49',
  queueSubtitle: '\u0e14\u0e36\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e04\u0e33\u0e02\u0e2d\u0e08\u0e23\u0e34\u0e07\u0e17\u0e35\u0e48\u0e16\u0e39\u0e01\u0e2a\u0e48\u0e07\u0e08\u0e32\u0e01 Patient App',
  activeCases: '\u0e40\u0e04\u0e2a',
  priority: '\u0e04\u0e27\u0e32\u0e21\u0e40\u0e23\u0e48\u0e07\u0e14\u0e48\u0e27\u0e19',
  viewEmpty: '\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e04\u0e33\u0e02\u0e2d\u0e08\u0e32\u0e01 Patient App',
  consultation: '\u0e04\u0e19\u0e44\u0e02\u0e49',
  claim: '\u0e23\u0e31\u0e1a\u0e04\u0e19\u0e44\u0e02\u0e49\u0e19\u0e35\u0e49',
  inReview: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e15\u0e23\u0e27\u0e08',
  completeCase: '\u0e2a\u0e48\u0e07\u0e1c\u0e25\u0e43\u0e2b\u0e49\u0e04\u0e19\u0e44\u0e02\u0e49',
  escalateCase: '\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e40\u0e04\u0e2a\u0e19\u0e35\u0e49',
  details: '\u0e2a\u0e23\u0e38\u0e1b\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e1a\u0e37\u0e49\u0e2d\u0e07\u0e15\u0e49\u0e19',
  province: '\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14',
  workflow: '\u0e2a\u0e16\u0e32\u0e19\u0e30',
  imageCount: '\u0e08\u0e33\u0e19\u0e27\u0e19\u0e23\u0e39\u0e1b',
  duration: '\u0e23\u0e30\u0e22\u0e30\u0e40\u0e27\u0e25\u0e32',
  redFlags: '\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e40\u0e15\u0e37\u0e2d\u0e19',
  submittedAt: '\u0e40\u0e27\u0e25\u0e32\u0e2a\u0e48\u0e07',
  patientLocation: 'พิกัดผู้ป่วย',
  locationUnavailable: 'ไม่มีพิกัดจากอุปกรณ์ผู้ป่วย',
  openMap: 'เปิดแผนที่',
  images: '\u0e23\u0e39\u0e1b\u0e1b\u0e23\u0e30\u0e01\u0e2d\u0e1a',
  noImages: '\u0e44\u0e21\u0e48\u0e21\u0e35\u0e23\u0e39\u0e1b\u0e41\u0e19\u0e1a',
  diagnosis: '\u0e04\u0e33\u0e27\u0e34\u0e19\u0e34\u0e08\u0e09\u0e31\u0e22',
  advice: '\u0e04\u0e33\u0e41\u0e19\u0e30\u0e19\u0e33',
  prescription: '\u0e23\u0e48\u0e32\u0e07 e-Prescription',
  med: '\u0e0a\u0e37\u0e48\u0e2d\u0e22\u0e32',
  dosage: '\u0e02\u0e19\u0e32\u0e14\u0e22\u0e32',
  frequency: '\u0e27\u0e34\u0e18\u0e35\u0e43\u0e0a\u0e49',
  addMedication: '+ \u0e40\u0e1e\u0e34\u0e48\u0e21\u0e22\u0e32',
  unreadableComplaint: '\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e2d\u0e48\u0e32\u0e19\u0e44\u0e21\u0e48\u0e2d\u0e2d\u0e01 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e2a\u0e2d\u0e1a\u0e16\u0e32\u0e21\u0e04\u0e19\u0e44\u0e02\u0e49\u0e40\u0e1e\u0e34\u0e48\u0e21',
  saveOk: '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25\u0e15\u0e2d\u0e1a\u0e01\u0e25\u0e31\u0e1a\u0e41\u0e25\u0e49\u0e27',
  escalateOk: '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e01\u0e32\u0e23\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e41\u0e25\u0e49\u0e27',
  saveFail: '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25\u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08',
  claimFail: '\u0e23\u0e31\u0e1a\u0e40\u0e04\u0e2a\u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08',
  signOut: '\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a',
  refresh: '\u0e42\u0e2b\u0e25\u0e14\u0e04\u0e34\u0e27\u0e43\u0e2b\u0e21\u0e48',
  days: '\u0e27\u0e31\u0e19'
} as const;

type QueueStatus = 'submitted' | 'triaged' | 'in_review' | 'awaiting_patient' | 'completed' | 'escalated';

type PrescriptionItem = {
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
};

type QueueItem = {
  id: string;
  patientId: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  chiefComplaint: string;
  priorityScore: number;
  status: QueueStatus | string;
  imageUrls: string[];
  symptomDurationDays: number;
  redFlags: string[];
  submittedAt: string;
  diagnosis?: string;
  advice?: string;
  prescriptionItems?: PrescriptionItem[];
};

type DoctorProfile = {
  id: string;
  displayName: string;
  provinceCodes: string[];
  specialty: 'dermatology';
};

type DoctorSession = {
  token: string;
  role: 'doctor';
  activeProvinceCode: string;
  doctor: DoctorProfile;
};

const STATUS_LABELS: Record<string, string> = {
  submitted: '\u0e23\u0e2d\u0e23\u0e31\u0e1a\u0e04\u0e34\u0e27',
  triaged: '\u0e1b\u0e23\u0e30\u0e40\u0e21\u0e34\u0e19\u0e41\u0e25\u0e49\u0e27',
  in_review: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e15\u0e23\u0e27\u0e08',
  awaiting_patient: '\u0e23\u0e2d\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e1e\u0e34\u0e48\u0e21',
  completed: '\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19',
  escalated: '\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d'
};

function formatThaiDate(value: string) {
  return new Date(value).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCoordinate(value?: number) {
  return typeof value === 'number' ? value.toFixed(6) : '-';
}

function emptyPrescription(): PrescriptionItem {
  return { medicationName: '', dosage: '', frequency: '', durationDays: 7 };
}

function looksUnreadable(value?: string | null) {
  const text = String(value ?? '').trim();
  if (!text) return false;

  const questionCount = (text.match(/\?/g) ?? []).length;
  const replacementChar = /\uFFFD/;

  return replacementChar.test(text) || questionCount >= Math.max(3, Math.floor(text.length * 0.35));
}

function sanitizeDisplayText(value?: string | null, fallback: string = '') {
  const text = String(value ?? '').trim();
  if (!text || looksUnreadable(text)) return fallback;
  return text;
}

function readSession(): DoctorSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as DoctorSession : null;
  } catch {
    return null;
  }
}

function writeSession(session: DoctorSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function apiFetch(path: string, token: string, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export default function App() {
  const [session, setSession] = useState<DoctorSession | null>(() => readSession());
  const [username, setUsername] = useState('dr.narin');
  const [password, setPassword] = useState('doctor123');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicationName: 'Hydrocortisone 1% cream', dosage: '\u0e31\u0e2b\u0e25\u0e2d\u0e14', frequency: '\u0e17\u0e32\u0e1a\u0e32\u0e07 \u0e46 \u0e27\u0e31\u0e19\u0e25\u0e30 2 \u0e04\u0e23\u0e31\u0e49\u0e07', durationDays: 7 },
    { medicationName: 'Cetirizine 10 mg', dosage: '10 mg', frequency: '\u0e23\u0e31\u0e1a\u0e1b\u0e23\u0e30\u0e17\u0e32\u0e19\u0e01\u0e48\u0e2d\u0e19\u0e19\u0e2d\u0e19', durationDays: 5 }
  ]);

  async function loadQueue(activeSession = session) {
    if (!activeSession) {
      setQueue([]);
      setSelectedId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch('/api/v1/doctor/queue', activeSession.token);
      if (!response.ok) throw new Error('API error');
      const payload = await response.json();
      const nextQueue = (Array.isArray(payload) ? payload : [])
        .filter((item) => ['submitted', 'triaged', 'in_review', 'awaiting_patient'].includes(item.status))
        .sort((a, b) => {
          if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        });

      setQueue(nextQueue);
      setSelectedId((current) => current && nextQueue.some((item) => item.id === current) ? current : nextQueue[0]?.id ?? null);
      setError(null);
    } catch {
      setError(TEXT.apiError);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      writeSession(session);
      void loadQueue(session);
      return;
    }

    writeSession(null);
    setQueue([]);
    setSelectedId(null);
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const refreshQueue = () => {
      void loadQueue(session);
    };

    const intervalId = window.setInterval(refreshQueue, QUEUE_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshQueue();
      }
    };

    window.addEventListener('focus', refreshQueue);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshQueue);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  const selected = useMemo(
    () => queue.find((item) => item.id === selectedId) ?? null,
    [queue, selectedId]
  );

  useEffect(() => {
    const defaultAdvice = '\u0e2b\u0e25\u0e35\u0e01\u0e40\u0e25\u0e35\u0e48\u0e22\u0e07\u0e2a\u0e34\u0e48\u0e07\u0e01\u0e23\u0e30\u0e15\u0e38\u0e49\u0e19 \u0e15\u0e34\u0e14\u0e15\u0e32\u0e21\u0e2d\u0e32\u0e01\u0e32\u0e23 \u0e41\u0e25\u0e30\u0e01\u0e25\u0e31\u0e1a\u0e21\u0e32\u0e1e\u0e1a\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e2b\u0e32\u0e01\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e41\u0e22\u0e48\u0e25\u0e07';
    setDiagnosis(
      sanitizeDisplayText(selected?.diagnosis) || sanitizeDisplayText(selected?.chiefComplaint)
    );
    setAdvice(sanitizeDisplayText(selected?.advice, defaultAdvice));
    setPrescriptions(selected?.prescriptionItems?.length ? selected.prescriptionItems : [
      { medicationName: 'Hydrocortisone 1% cream', dosage: '\u0e31\u0e2b\u0e25\u0e2d\u0e14', frequency: '\u0e17\u0e32\u0e1a\u0e32\u0e07 \u0e46 \u0e27\u0e31\u0e19\u0e25\u0e30 2 \u0e04\u0e23\u0e31\u0e49\u0e07', durationDays: 7 }
    ]);
  }, [selected]);

  async function signIn() {
    if (username.trim().length < 3 || password.length < 6) {
      setError(TEXT.loginFail);
      return;
    }

    setIsSigningIn(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/doctor/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      if (!response.ok) throw new Error('login failed');
      const payload = await response.json();
      setSession(payload as DoctorSession);
    } catch {
      setError(TEXT.loginFail);
    } finally {
      setIsSigningIn(false);
    }
  }

  function signOut() {
    setSession(null);
    setError(null);
    setNotice(null);
    setDiagnosis('');
    setAdvice('');
    setPassword('');
  }

  async function claimSelected() {
    if (!selected || !session) return;
    setNotice(null);
    setError(null);

    try {
      const response = await apiFetch(`/api/v1/doctor/queue/${selected.id}/claim`, session.token, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('claim failed');
      const payload = await response.json();
      setQueue((current) => current.map((item) => item.id === payload.id ? payload : item));
      setNotice(TEXT.inReview);
    } catch {
      setError(TEXT.claimFail);
    }
  }

  function updatePrescription(index: number, field: keyof PrescriptionItem, value: string | number) {
    setPrescriptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  async function submitSelected(escalated: boolean) {
    if (!selected || !session || diagnosis.trim().length < 3 || advice.trim().length < 3) {
      setError(TEXT.saveFail);
      return;
    }

    setSubmitting(true);
    setNotice(null);
    setError(null);

    const prescriptionItems = prescriptions
      .filter((item) => item.medicationName.trim() && item.dosage.trim() && item.frequency.trim())
      .map((item) => ({ ...item, durationDays: Number(item.durationDays) || 1 }));

    try {
      const response = await apiFetch(`/api/v1/doctor/consultations/${selected.id}/respond`, session.token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: diagnosis.trim(),
          advice: advice.trim(),
          escalated,
          prescriptionItems
        })
      });

      if (!response.ok) throw new Error('respond failed');

      setQueue((current) => current.filter((item) => item.id !== selected.id));
      setSelectedId((current) => {
        if (current !== selected.id) return current;
        const remaining = queue.filter((item) => item.id !== selected.id);
        return remaining[0]?.id ?? null;
      });
      setNotice(escalated ? TEXT.escalateOk : TEXT.saveOk);
    } catch {
      setError(TEXT.saveFail);
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen text-white">
        {error && <div className="bg-rose-700 px-4 py-2 text-center text-sm">{error}</div>}
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8">
          <section className="w-full rounded-[2rem] border border-white/10 bg-[#0b1220] p-6 md:p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">Doctor App</div>
            <h1 className="mt-3 text-3xl font-semibold">{TEXT.loginTitle}</h1>
            <p className="mt-2 text-sm text-white/60">{TEXT.loginSubtitle}</p>

            <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Demo: {TEXT.demoHint}
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <div className="mb-2 text-sm text-white/70">{TEXT.usernameLabel}</div>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm text-white/70">{TEXT.passwordLabel}</div>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={signIn}
              disabled={isSigningIn || !username.trim() || !password}
              className="mt-6 w-full rounded-2xl bg-clinic-blue px-5 py-3 font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              {isSigningIn ? TEXT.loading : TEXT.loginButton}
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="rounded-full bg-white/10 px-5 py-4 text-2xl font-semibold">MD</div>
            <p className="mt-4 text-lg">{TEXT.loading}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white">
      {error && <div className="bg-rose-700 px-4 py-2 text-center text-sm">{error}</div>}
      {notice && <div className="bg-emerald-700 px-4 py-2 text-center text-sm">{notice}</div>}

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[340px,1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Doctor App</div>
              <h1 className="mt-2 text-2xl font-semibold">{TEXT.queueTitle}</h1>
              <p className="mt-1 text-sm text-white/60">{TEXT.queueSubtitle}</p>
            </div>
            <div className="rounded-2xl bg-clinic-amber/20 px-3 py-2 text-sm text-clinic-amber">
              {queue.length} {TEXT.activeCases}
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-sm font-medium">{session.doctor.displayName}</div>
            <div className="mt-1 text-xs text-white/55">{TEXT.province} {session.activeProvinceCode}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => void loadQueue()} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5">
                {TEXT.refresh}
              </button>
              <button type="button" onClick={signOut} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5">
                {TEXT.signOut}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {queue.map((item) => {
              const isActive = selected?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? 'border-clinic-blue bg-clinic-blue/15'
                      : 'border-white/10 bg-slate-950/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.id.slice(0, 8).toUpperCase()}</div>
                      <div className="mt-1 text-xs text-white/45">{TEXT.province} {item.provinceCode}</div>
                    </div>
                    <div className="rounded-full bg-white/10 px-2 py-1 text-xs">P{item.priorityScore}</div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-white/80">{sanitizeDisplayText(item.chiefComplaint, TEXT.unreadableComplaint)}</p>
                  <div className="mt-3 text-xs uppercase tracking-[0.2em] text-white/40">{STATUS_LABELS[item.status] ?? item.status}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b1220] p-5 md:p-6">
          {selected ? (
            <>
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/40">{TEXT.consultation}</div>
                  <h2 className="mt-2 text-3xl font-semibold">{selected.id}</h2>
                  <p className="mt-3 text-white/75">{sanitizeDisplayText(selected.chiefComplaint, TEXT.unreadableComplaint)}</p>
                </div>
                <button type="button" onClick={claimSelected} className="rounded-2xl bg-clinic-blue px-5 py-3 font-medium text-white transition hover:bg-blue-600">
                  {selected.status === 'in_review' ? TEXT.inReview : TEXT.claim}
                </button>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr,1fr]">
                <div className="space-y-5">
                  <section className="rounded-[1.5rem] bg-white/5 p-5">
                    <h3 className="text-lg font-medium">{TEXT.details}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <Metric label={TEXT.province} value={selected.provinceCode} />
                      <Metric label={TEXT.priority} value={`P${selected.priorityScore}`} />
                      <Metric label={TEXT.workflow} value={STATUS_LABELS[selected.status] ?? selected.status} />
                      <Metric label={TEXT.imageCount} value={String(selected.imageUrls.length)} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Metric label={TEXT.duration} value={`${selected.symptomDurationDays} ${TEXT.days}`} />
                      <Metric label={TEXT.submittedAt} value={formatThaiDate(selected.submittedAt)} />
                    </div>
                    {selected.redFlags.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                        <div className="text-xs uppercase tracking-[0.2em] text-amber-200/80">{TEXT.redFlags}</div>
                        <div className="mt-2 leading-6">{selected.redFlags.join(', ')}</div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[1.5rem] bg-white/5 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-lg font-medium">{TEXT.patientLocation}</div>
                      {typeof selected.latitude === 'number' && typeof selected.longitude === 'number' && (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=16/${selected.latitude}/${selected.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
                        >
                          {TEXT.openMap}
                        </a>
                      )}
                    </div>

                    {typeof selected.latitude === 'number' && typeof selected.longitude === 'number' ? (
                      <>
                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                          <Metric label="Latitude" value={formatCoordinate(selected.latitude)} />
                          <Metric label="Longitude" value={formatCoordinate(selected.longitude)} />
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                          <iframe
                            title={`consultation-map-${selected.id}`}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.longitude - 0.01}%2C${selected.latitude - 0.01}%2C${selected.longitude + 0.01}%2C${selected.latitude + 0.01}&layer=mapnik&marker=${selected.latitude}%2C${selected.longitude}`}
                            className="h-72 w-full border-0"
                            loading="lazy"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-white/55">
                        {TEXT.locationUnavailable}
                      </div>
                    )}
                  </section>

                  <section className="rounded-[1.5rem] bg-white/5 p-5">
                    <div className="mb-3 text-lg font-medium">{TEXT.images}</div>
                    {selected.imageUrls.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {selected.imageUrls.map((url, index) => (
                          <img key={index} src={url} alt={`consultation-${index + 1}`} className="h-28 w-28 rounded-2xl object-cover" />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-white/55">{TEXT.noImages}</div>
                    )}
                  </section>
                </div>

                <div className="space-y-5">
                  <section className="rounded-[1.5rem] bg-white/5 p-5">
                    <div className="mb-3 text-lg font-medium">{TEXT.diagnosis}</div>
                    <textarea className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none" value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} />
                  </section>

                  <section className="rounded-[1.5rem] bg-white/5 p-5">
                    <div className="mb-3 text-lg font-medium">{TEXT.advice}</div>
                    <textarea className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none" value={advice} onChange={(event) => setAdvice(event.target.value)} />
                  </section>

                  <section className="rounded-[1.5rem] bg-gradient-to-br from-white/10 to-white/5 p-5">
                    <h3 className="text-lg font-medium">{TEXT.prescription}</h3>
                    <div className="mt-4 space-y-3">
                      {prescriptions.map((item, index) => (
                        <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                          <input className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none" value={item.medicationName} placeholder={TEXT.med} onChange={(event) => updatePrescription(index, 'medicationName', event.target.value)} />
                          <div className="grid grid-cols-2 gap-2">
                            <input className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none" value={item.dosage} placeholder={TEXT.dosage} onChange={(event) => updatePrescription(index, 'dosage', event.target.value)} />
                            <input className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none" value={item.frequency} placeholder={TEXT.frequency} onChange={(event) => updatePrescription(index, 'frequency', event.target.value)} />
                          </div>
                          <input className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none" type="number" min="1" value={item.durationDays} onChange={(event) => updatePrescription(index, 'durationDays', Number(event.target.value) || 1)} />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setPrescriptions((current) => [...current, emptyPrescription()])} className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 text-white/80 transition hover:bg-white/5">
                      {TEXT.addMedication}
                    </button>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button type="button" disabled={submitting} onClick={() => submitSelected(false)} className="w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-60">
                        {submitting ? TEXT.loading : TEXT.completeCase}
                      </button>
                      <button type="button" disabled={submitting} onClick={() => submitSelected(true)} className="w-full rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-rose-200 transition hover:bg-rose-400/20 disabled:opacity-60">
                        {submitting ? TEXT.loading : TEXT.escalateCase}
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-white/60">{TEXT.viewEmpty}</div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-2 text-base font-medium break-words">{value}</p>
    </div>
  );
}


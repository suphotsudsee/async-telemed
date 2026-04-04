import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const SESSION_KEY = 'admin_session';

const PROVINCES = [
  { code: '10', name: 'กรุงเทพมหานคร' },
  { code: '11', name: 'สมุทรปราการ' },
  { code: '12', name: 'นนทบุรี' },
  { code: '13', name: 'ปทุมธานี' },
  { code: '50', name: 'เชียงใหม่' },
  { code: '51', name: 'ลำพูน' },
  { code: '52', name: 'ลำปาง' },
  { code: '83', name: 'ภูเก็ต' }
] as const;

const TEXT = {
  appTitle: '\u0e28\u0e39\u0e19\u0e22\u0e4c\u0e04\u0e27\u0e1a\u0e04\u0e38\u0e21\u0e07\u0e32\u0e19',
  appSubtitle: '\u0e14\u0e39\u0e20\u0e32\u0e1e\u0e23\u0e27\u0e21 SLA, \u0e20\u0e32\u0e23\u0e30\u0e04\u0e34\u0e27, \u0e41\u0e25\u0e30\u0e04\u0e27\u0e32\u0e21\u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e25\u0e38\u0e21\u0e02\u0e2d\u0e07\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e41\u0e1a\u0e1a real-time',
  loginTitle: '\u0e40\u0e02\u0e49\u0e32\u0e43\u0e0a\u0e49\u0e07\u0e32\u0e19 Admin App',
  loginSubtitle: '\u0e43\u0e0a\u0e49\u0e1a\u0e31\u0e0d\u0e0a\u0e35 admin \u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e40\u0e02\u0e49\u0e32\u0e16\u0e36\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 SLA \u0e41\u0e25\u0e30 routing',
  loginFail: '\u0e40\u0e02\u0e49\u0e32\u0e23\u0e30\u0e1a\u0e1a\u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08',
  username: 'Username',
  password: '\u0e23\u0e2b\u0e31\u0e2a\u0e1c\u0e48\u0e32\u0e19',
  signIn: '\u0e40\u0e02\u0e49\u0e32\u0e17\u0e33\u0e07\u0e32\u0e19',
  signOut: '\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a',
  refresh: '\u0e42\u0e2b\u0e25\u0e14\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e43\u0e2b\u0e21\u0e48',
  loading: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25...',
  apiError: '\u0e42\u0e2b\u0e25\u0e14\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 admin \u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08',
  openCases: '\u0e04\u0e34\u0e27\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e40\u0e1b\u0e34\u0e14\u0e2d\u0e22\u0e39\u0e48',
  firstBreaches: '\u0e40\u0e04\u0e2a\u0e40\u0e2a\u0e35\u0e48\u0e22\u0e07 SLA \u0e41\u0e23\u0e01',
  completionBreaches: '\u0e40\u0e04\u0e2a\u0e40\u0e01\u0e34\u0e19 SLA \u0e1b\u0e34\u0e14\u0e07\u0e32\u0e19',
  escalatedCases: 'เคสที่ส่งต่อ',
  activeProvinces: '\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14\u0e17\u0e35\u0e48\u0e21\u0e35\u0e04\u0e34\u0e27',
  avgWait: '\u0e40\u0e27\u0e25\u0e32\u0e23\u0e2d\u0e40\u0e09\u0e25\u0e35\u0e48\u0e22',
  provinceTable: '\u0e20\u0e32\u0e1e\u0e23\u0e27\u0e21\u0e15\u0e32\u0e21\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14',
  provinceHint: '\u0e14\u0e39\u0e08\u0e33\u0e19\u0e27\u0e19\u0e04\u0e34\u0e27\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e04\u0e49\u0e32\u0e07, \u0e40\u0e04\u0e2a\u0e17\u0e35\u0e48\u0e40\u0e2a\u0e35\u0e48\u0e22\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e01\u0e34\u0e19 SLA \u0e41\u0e25\u0e30\u0e08\u0e33\u0e19\u0e27\u0e19\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e25\u0e38\u0e21',
  escalationTable: 'รายงานการส่งต่อ',
  escalationHint: 'สรุปจำนวนเคสที่แพทย์ส่งต่อ แยกตามจังหวัดเพื่อใช้ดูภาระเคสซับซ้อน',
  escalated: 'ส่งต่อ',
  lastEscalatedAt: 'ส่งต่อล่าสุด',
  escalationEmpty: 'ยังไม่มีเคสส่งต่อในระบบ',
  escalationDetails: 'รายละเอียดเคสส่งต่อ',
  escalationCases: 'รายการเคสที่ถูกส่งต่อในจังหวัดนี้',
  consultationId: 'เลขเคส',
  chiefComplaint: 'อาการหลัก',
  status: 'สถานะ',
  detail: 'รายละเอียด',
  showDetails: 'ดูรายละเอียด',
  hideDetails: 'ซ่อนรายละเอียด',
  watchTitle: '\u0e08\u0e38\u0e14\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e08\u0e31\u0e1a\u0e15\u0e32',
  watchEmpty: '\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e40\u0e2a\u0e35\u0e48\u0e22\u0e07\u0e23\u0e38\u0e19\u0e41\u0e23\u0e07\u0e43\u0e19\u0e23\u0e2d\u0e1a\u0e19\u0e35\u0e49',
  generatedAt: '\u0e2d\u0e31\u0e1b\u0e40\u0e14\u0e15\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14',
  province: '\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14',
  open: '\u0e04\u0e34\u0e27\u0e04\u0e49\u0e32\u0e07',
  risk: '\u0e40\u0e2a\u0e35\u0e48\u0e22\u0e07/\u0e40\u0e01\u0e34\u0e19 SLA',
  doctors: '\u0e08\u0e33\u0e19\u0e27\u0e19\u0e41\u0e1e\u0e17\u0e22\u0e4c',
  closedRate: '\u0e2d\u0e31\u0e15\u0e23\u0e32\u0e1b\u0e34\u0e14\u0e07\u0e32\u0e19',
  mins: '\u0e19\u0e32\u0e17\u0e35',
  demoHint: 'admin / admin123',
  dashboardTab: 'Dashboard',
  settingsTab: 'Settings',
  doctorSettingsTitle: 'ตั้งค่าจังหวัดที่แพทย์รับเคส',
  doctorSettingsHint: 'กำหนด coverage ของแพทย์แต่ละคนเพื่อให้คิวจากจังหวัดนั้นส่งเข้า Doctor App ได้',
  coveredProvinces: 'จังหวัดที่รับเคส',
  saveCoverage: 'บันทึกการตั้งค่า',
  saving: 'กำลังบันทึก...',
  saveCoverageOk: 'บันทึกการตั้งค่าแพทย์แล้ว',
  saveCoverageFail: 'บันทึกการตั้งค่าแพทย์ไม่สำเร็จ'
} as const;

type AdminSession = {
  token: string;
  role: 'admin';
  admin: {
    id: string;
    displayName: string;
  };
};

type Consultation = {
  id: string;
  provinceCode: string;
  status: string;
  chiefComplaint?: string;
  firstResponseDueAt: string;
  completionDueAt: string;
  respondedAt?: string;
};

type SlaItem = {
  status: string;
  count: number;
  avgWaitMinutes: number;
};

type RoutingItem = {
  provinceCode: string;
  doctorCount: number;
};

type Doctor = {
  id: string;
  displayName: string;
  provinceCodes: string[];
  specialty: 'dermatology';
};

type ProvinceRow = {
  provinceCode: string;
  openCount: number;
  riskCount: number;
  doctorCount: number;
  completionRate: number;
};

type EscalationRow = {
  provinceCode: string;
  escalatedCount: number;
  lastEscalatedAt?: string;
};

type EscalatedConsultation = Consultation;

function readSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: AdminSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function formatThaiDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatMinutes(value: number) {
  return `${Math.round(value)} ${TEXT.mins}`;
}

function provinceLabel(provinceCode: string) {
  return PROVINCES.find((item) => item.code === provinceCode)?.name ?? provinceCode;
}

function isOpenStatus(status: string) {
  return ['submitted', 'triaged', 'in_review', 'awaiting_patient'].includes(status);
}

function isFirstResponseRisk(item: Consultation) {
  return ['submitted', 'triaged'].includes(item.status) && new Date(item.firstResponseDueAt).getTime() < Date.now();
}

function isCompletionRisk(item: Consultation) {
  return isOpenStatus(item.status) && new Date(item.completionDueAt).getTime() < Date.now();
}

export default function App() {
  const [session, setSession] = useState<AdminSession | null>(() => readSession());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [slaItems, setSlaItems] = useState<SlaItem[]>([]);
  const [routingItems, setRoutingItems] = useState<RoutingItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [savingDoctorId, setSavingDoctorId] = useState<string | null>(null);
  const [selectedEscalationProvince, setSelectedEscalationProvince] = useState<string | null>(null);

  async function loadDashboard(activeSession = session) {
    if (!activeSession) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const consultationsResponse = await fetch(`${API_BASE}/api/v1/consultations`);
      if (!consultationsResponse.ok) throw new Error('consultations');
      const consultationsPayload = (await consultationsResponse.json()) as Consultation[];

      const slaResponse = await fetch(`${API_BASE}/api/v1/admin/sla`, {
        headers: { Authorization: `Bearer ${activeSession.token}` }
      });
      if (!slaResponse.ok) throw new Error('sla');
      const slaPayload = await slaResponse.json();

      const provinceCodes = Array.from(new Set((consultationsPayload ?? []).map((item) => item.provinceCode).filter(Boolean)));
      const routingQuery = provinceCodes.length > 0 ? `?provinces=${provinceCodes.join(',')}` : '';
      const routingResponse = await fetch(`${API_BASE}/api/v1/admin/routing${routingQuery}`);
      if (!routingResponse.ok) throw new Error('routing');
      const routingPayload = (await routingResponse.json()) as RoutingItem[];

      const doctorsResponse = await fetch(`${API_BASE}/api/v1/admin/doctors`, {
        headers: { Authorization: `Bearer ${activeSession.token}` }
      });
      if (!doctorsResponse.ok) throw new Error('doctors');
      const doctorsPayload = (await doctorsResponse.json()) as Doctor[];

      setConsultations(Array.isArray(consultationsPayload) ? consultationsPayload : []);
      setSlaItems(Array.isArray(slaPayload?.items) ? slaPayload.items : []);
      setRoutingItems(Array.isArray(routingPayload) ? routingPayload : []);
      setDoctors(Array.isArray(doctorsPayload) ? doctorsPayload : []);
      setGeneratedAt(String(slaPayload?.generatedAt ?? new Date().toISOString()));
    } catch {
      setError(TEXT.apiError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      writeSession(session);
      void loadDashboard(session);
      return;
    }

    writeSession(null);
    setLoading(false);
  }, [session]);

  async function signIn() {
    if (!username.trim() || !password) {
      setError(TEXT.loginFail);
      return;
    }

    setSigningIn(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      if (!response.ok) throw new Error('login');
      const payload = (await response.json()) as AdminSession;
      setSession(payload);
    } catch {
      setError(TEXT.loginFail);
    } finally {
      setSigningIn(false);
    }
  }

  function signOut() {
    setSession(null);
    setActiveTab('dashboard');
    setConsultations([]);
    setSlaItems([]);
    setRoutingItems([]);
    setDoctors([]);
    setGeneratedAt('');
    setError(null);
    setNotice(null);
  }

  async function saveDoctorCoverage(doctorId: string, provinceCodes: string[]) {
    if (!session) return;

    setSavingDoctorId(doctorId);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/doctors/${doctorId}/provinces`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ provinceCodes })
      });

      if (!response.ok) throw new Error('save doctor coverage');

      const payload = (await response.json()) as Doctor;
      let nextDoctors: Doctor[] = [];
      setDoctors((current) => {
        nextDoctors = current.map((item) => item.id === payload.id ? payload : item);
        return nextDoctors;
      });
      setRoutingItems((current) => {
        const next = new Map(current.map((item) => [item.provinceCode, item.doctorCount]));

        for (const province of PROVINCES) {
          const doctorsCovering = nextDoctors
            .filter((item) => item.provinceCodes.includes(province.code))
            .length;

          if (doctorsCovering > 0 || next.has(province.code)) {
            next.set(province.code, doctorsCovering);
          }
        }

        return Array.from(next.entries()).map(([provinceCode, doctorCount]) => ({ provinceCode, doctorCount }));
      });
      setNotice(TEXT.saveCoverageOk);
    } catch {
      setError(TEXT.saveCoverageFail);
    } finally {
      setSavingDoctorId(null);
    }
  }

  const summary = useMemo(() => {
    const openCases = consultations.filter((item) => isOpenStatus(item.status));
    const firstBreaches = openCases.filter((item) => isFirstResponseRisk(item)).length;
    const completionBreaches = openCases.filter((item) => isCompletionRisk(item)).length;
    const escalatedCases = consultations.filter((item) => item.status === 'escalated').length;
    const activeProvinces = new Set(openCases.map((item) => item.provinceCode)).size;
    const avgWaitMinutes = slaItems.length > 0
      ? slaItems.reduce((sum, item) => sum + item.avgWaitMinutes, 0) / slaItems.length
      : 0;

    return { openCases: openCases.length, firstBreaches, completionBreaches, escalatedCases, activeProvinces, avgWaitMinutes };
  }, [consultations, slaItems]);

  const provinceRows = useMemo<ProvinceRow[]>(() => {
    const routingMap = new Map(routingItems.map((item) => [item.provinceCode, item.doctorCount]));
    const grouped = new Map<string, { openCount: number; riskCount: number; completed: number; total: number }>();

    for (const item of consultations) {
      const current = grouped.get(item.provinceCode) ?? { openCount: 0, riskCount: 0, completed: 0, total: 0 };
      current.total += 1;
      if (isOpenStatus(item.status)) current.openCount += 1;
      if (isFirstResponseRisk(item) || isCompletionRisk(item)) current.riskCount += 1;
      if (item.status === 'completed' || item.status === 'escalated') current.completed += 1;
      grouped.set(item.provinceCode, current);
    }

    return Array.from(grouped.entries())
      .map(([provinceCode, value]) => ({
        provinceCode,
        openCount: value.openCount,
        riskCount: value.riskCount,
        doctorCount: routingMap.get(provinceCode) ?? 0,
        completionRate: value.total > 0 ? Math.round((value.completed / value.total) * 100) : 0
      }))
      .sort((a, b) => b.openCount - a.openCount || b.riskCount - a.riskCount || a.provinceCode.localeCompare(b.provinceCode));
  }, [consultations, routingItems]);

  const watchItems = useMemo(() => {
    return provinceRows.filter((row) => row.riskCount > 0 || (row.openCount > 0 && row.doctorCount === 0)).slice(0, 4);
  }, [provinceRows]);

  const escalationRows = useMemo<EscalationRow[]>(() => {
    const grouped = new Map<string, EscalationRow>();

    for (const item of consultations.filter((consultation) => consultation.status === 'escalated')) {
      const current = grouped.get(item.provinceCode) ?? {
        provinceCode: item.provinceCode,
        escalatedCount: 0,
        lastEscalatedAt: undefined
      };

      current.escalatedCount += 1;
      if (item.respondedAt && (!current.lastEscalatedAt || new Date(item.respondedAt).getTime() > new Date(current.lastEscalatedAt).getTime())) {
        current.lastEscalatedAt = item.respondedAt;
      }
      grouped.set(item.provinceCode, current);
    }

    return Array.from(grouped.values()).sort((a, b) =>
      b.escalatedCount - a.escalatedCount || a.provinceCode.localeCompare(b.provinceCode)
    );
  }, [consultations]);

  const escalatedConsultations = useMemo<EscalatedConsultation[]>(() => {
    if (!selectedEscalationProvince) {
      return [];
    }

    return consultations
      .filter((item) => item.status === 'escalated' && item.provinceCode === selectedEscalationProvince)
      .sort((a, b) => new Date(b.respondedAt ?? 0).getTime() - new Date(a.respondedAt ?? 0).getTime());
  }, [consultations, selectedEscalationProvince]);

  if (!session) {
    return (
      <main className="min-h-screen px-4 py-6 text-slate-900">
        {error && <div className="bg-rose-700 px-4 py-2 text-center text-sm text-white">{error}</div>}
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center">
          <section className="w-full rounded-[2.25rem] bg-ops-navy p-8 text-white shadow-2xl">
            <div className="text-xs uppercase tracking-[0.35em] text-white/55">Admin App</div>
            <h1 className="mt-4 text-3xl font-extrabold">{TEXT.loginTitle}</h1>
            <p className="mt-2 text-sm text-white/70">{TEXT.loginSubtitle}</p>
            <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85">Demo: {TEXT.demoHint}</div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <div className="mb-2 text-sm text-white/70">{TEXT.username}</div>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-white outline-none" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
              </label>
              <label className="block">
                <div className="mb-2 text-sm text-white/70">{TEXT.password}</div>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-white outline-none" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </label>
            </div>

            <button type="button" onClick={signIn} disabled={signingIn} className="mt-6 w-full rounded-2xl bg-ops-cyan px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
              {signingIn ? TEXT.loading : TEXT.signIn}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 text-slate-900">
      {error && <div className="bg-rose-700 px-4 py-2 text-center text-sm text-white">{error}</div>}
      {notice && <div className="bg-emerald-700 px-4 py-2 text-center text-sm text-white">{notice}</div>}
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] bg-ops-navy px-6 py-8 text-white shadow-2xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">Admin App</p>
              <h1 className="mt-3 text-4xl font-extrabold">{TEXT.appTitle}</h1>
              <p className="mt-3 max-w-2xl text-white/75">{TEXT.appSubtitle}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/10 px-5 py-4">
                <p className="text-sm text-white/60">{session.admin.displayName}</p>
                <p className="mt-1 text-lg font-semibold">{TEXT.generatedAt}</p>
                <p className="mt-1 text-sm text-white/75">{formatThaiDate(generatedAt)}</p>
              </div>
              <div className="grid gap-2">
                <button type="button" onClick={() => void loadDashboard()} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15">{TEXT.refresh}</button>
                <button type="button" onClick={signOut} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">{TEXT.signOut}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-ops-navy text-white' : 'bg-white text-ops-navy shadow-lg'}`}
          >
            {TEXT.dashboardTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${activeTab === 'settings' ? 'bg-ops-navy text-white' : 'bg-white text-ops-navy shadow-lg'}`}
          >
            {TEXT.settingsTab}
          </button>
        </section>

        {loading ? (
          <section className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-lg">{TEXT.loading}</section>
        ) : activeTab === 'dashboard' ? (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <MetricCard label={TEXT.openCases} value={String(summary.openCases)} tone="bg-white" />
              <MetricCard label={TEXT.firstBreaches} value={String(summary.firstBreaches)} tone="bg-amber-50" />
              <MetricCard label={TEXT.completionBreaches} value={String(summary.completionBreaches)} tone="bg-rose-50" />
              <MetricCard label={TEXT.escalatedCases} value={String(summary.escalatedCases)} tone="bg-violet-50" />
              <MetricCard label={TEXT.activeProvinces} value={String(summary.activeProvinces)} tone="bg-emerald-50" />
              <MetricCard label={TEXT.avgWait} value={formatMinutes(summary.avgWaitMinutes)} tone="bg-sky-50" />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr,1fr]">
              <article className="rounded-[2rem] bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ops-cyan">{TEXT.provinceTable}</p>
                    <h2 className="text-2xl font-bold text-ops-navy">{TEXT.provinceHint}</h2>
                  </div>
                  <div className="text-sm text-slate-500">{provinceRows.length} {TEXT.activeProvinces}</div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-100">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3">{TEXT.province}</th>
                        <th className="px-4 py-3">{TEXT.open}</th>
                        <th className="px-4 py-3">{TEXT.risk}</th>
                        <th className="px-4 py-3">{TEXT.doctors}</th>
                        <th className="px-4 py-3">{TEXT.closedRate}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {provinceRows.map((row) => (
                        <tr key={row.provinceCode} className="border-t border-slate-100">
                          <td className="px-4 py-4 font-semibold text-ops-navy">{row.provinceCode}</td>
                          <td className="px-4 py-4">{row.openCount}</td>
                          <td className="px-4 py-4">{row.riskCount}</td>
                          <td className="px-4 py-4">{row.doctorCount}</td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">{row.completionRate}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-[2rem] bg-gradient-to-br from-ops-cyan to-sky-500 p-6 text-white shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">{TEXT.watchTitle}</p>
                <h2 className="mt-3 text-2xl font-bold">{TEXT.appTitle}</h2>
                <div className="mt-6 space-y-4">
                  {watchItems.length > 0 ? watchItems.map((item) => (
                    <div key={item.provinceCode} className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur">
                      <div className="font-semibold">{TEXT.province} {item.provinceCode}</div>
                      <div className="mt-2 text-sm text-white/85">{TEXT.open}: {item.openCount}</div>
                      <div className="mt-1 text-sm text-white/85">{TEXT.risk}: {item.riskCount}</div>
                      <div className="mt-1 text-sm text-white/85">{TEXT.doctors}: {item.doctorCount}</div>
                    </div>
                  )) : (
                    <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur">{TEXT.watchEmpty}</div>
                  )}
                </div>
              </article>
            </section>

            <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-lg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-500">{TEXT.escalationTable}</p>
                  <h2 className="text-2xl font-bold text-ops-navy">{TEXT.escalationHint}</h2>
                </div>
                <div className="text-sm text-slate-500">{summary.escalatedCases} {TEXT.escalatedCases}</div>
              </div>

              {escalationRows.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-100">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3">{TEXT.province}</th>
                        <th className="px-4 py-3">{TEXT.escalated}</th>
                        <th className="px-4 py-3">{TEXT.doctors}</th>
                        <th className="px-4 py-3">{TEXT.lastEscalatedAt}</th>
                        <th className="px-4 py-3">{TEXT.detail}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escalationRows.map((row) => (
                        <tr key={row.provinceCode} className="border-t border-slate-100">
                          <td className="px-4 py-4 font-semibold text-ops-navy">{provinceLabel(row.provinceCode)}</td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-700">{row.escalatedCount}</span>
                          </td>
                          <td className="px-4 py-4">{routingItems.find((item) => item.provinceCode === row.provinceCode)?.doctorCount ?? 0}</td>
                          <td className="px-4 py-4">{formatThaiDate(row.lastEscalatedAt)}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedEscalationProvince((current) => current === row.provinceCode ? null : row.provinceCode)}
                              className="rounded-2xl border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                            >
                              {selectedEscalationProvince === row.provinceCode ? TEXT.hideDetails : TEXT.showDetails}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  {TEXT.escalationEmpty}
                </div>
              )}

              {selectedEscalationProvince && (
                <div className="mt-5 rounded-[1.5rem] border border-violet-100 bg-violet-50/60 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-violet-500">{TEXT.escalationDetails}</p>
                      <h3 className="text-xl font-bold text-ops-navy">
                        {TEXT.province} {provinceLabel(selectedEscalationProvince)}
                      </h3>
                    </div>
                    <div className="text-sm text-slate-500">{escalatedConsultations.length} {TEXT.escalationCases}</div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-violet-100 bg-white">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-violet-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3">{TEXT.consultationId}</th>
                          <th className="px-4 py-3">{TEXT.chiefComplaint}</th>
                          <th className="px-4 py-3">{TEXT.status}</th>
                          <th className="px-4 py-3">{TEXT.lastEscalatedAt}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {escalatedConsultations.map((item) => (
                          <tr key={item.id} className="border-t border-violet-100">
                            <td className="px-4 py-4 font-semibold text-ops-navy">{item.id}</td>
                            <td className="px-4 py-4 text-slate-600">{item.chiefComplaint ?? '-'}</td>
                            <td className="px-4 py-4">{item.status}</td>
                            <td className="px-4 py-4">{formatThaiDate(item.respondedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ops-cyan">{TEXT.settingsTab}</p>
                <h2 className="text-2xl font-bold text-ops-navy">{TEXT.doctorSettingsTitle}</h2>
              </div>
              <div className="text-sm text-slate-500">{TEXT.doctorSettingsHint}</div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {doctors.map((doctor) => (
                <DoctorCoverageCard
                  key={doctor.id}
                  doctor={doctor}
                  saving={savingDoctorId === doctor.id}
                  onSave={saveDoctorCoverage}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <article className={`rounded-[1.75rem] ${tone} p-5 shadow-lg`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-extrabold text-ops-navy">{value}</p>
    </article>
  );
}

function DoctorCoverageCard({
  doctor,
  saving,
  onSave
}: {
  doctor: Doctor;
  saving: boolean;
  onSave: (doctorId: string, provinceCodes: string[]) => Promise<void>;
}) {
  const [selectedProvinceCodes, setSelectedProvinceCodes] = useState<string[]>(doctor.provinceCodes);

  useEffect(() => {
    setSelectedProvinceCodes(doctor.provinceCodes);
  }, [doctor.id, doctor.provinceCodes]);

  function toggleProvince(provinceCode: string) {
    setSelectedProvinceCodes((current) =>
      current.includes(provinceCode)
        ? current.filter((item) => item !== provinceCode)
        : [...current, provinceCode].sort()
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-ops-navy">{doctor.displayName}</h3>
          <p className="mt-1 text-sm text-slate-500">{doctor.specialty}</p>
          <p className="mt-3 text-sm text-slate-600">
            {TEXT.coveredProvinces}: {selectedProvinceCodes.length > 0 ? selectedProvinceCodes.map(provinceLabel).join(', ') : '-'}
          </p>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ops-navy shadow-sm">
          {selectedProvinceCodes.length} จังหวัด
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {PROVINCES.map((province) => {
          const checked = selectedProvinceCodes.includes(province.code);
          return (
            <label
              key={province.code}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${checked ? 'border-ops-cyan bg-cyan-50 text-ops-navy' : 'border-white bg-white text-slate-600'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleProvince(province.code)}
                className="h-4 w-4 rounded"
              />
              <span className="font-medium">{province.name}</span>
              <span className="ml-auto text-xs text-slate-400">{province.code}</span>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave(doctor.id, selectedProvinceCodes)}
        className="mt-5 rounded-2xl bg-ops-navy px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {saving ? TEXT.saving : TEXT.saveCoverage}
      </button>
    </article>
  );
}

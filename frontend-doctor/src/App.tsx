import { useEffect, useState } from "react";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

type QueueItem = {
  id: string;
  provinceCode: string;
  chiefComplaint: string;
  priorityScore: number;
  status: string;
  imageUrls: string[];
};

export default function App() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<QueueItem | null>(null);

  useEffect(() => {
    fetch(`${apiBase}/api/v1/doctor/queue?provinces=10,50`)
      .then((response) => response.json())
      .then((payload) => {
        setQueue(payload);
        setSelected(payload[0] ?? null);
      });
  }, []);

  async function claimSelected() {
    if (!selected) {
      return;
    }

    const response = await fetch(`${apiBase}/api/v1/doctor/queue/${selected.id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: "doctor-bkk-1" })
    });

    const payload = await response.json();
    setSelected(payload);
    setQueue((current) => current.map((item) => (item.id === payload.id ? payload : item)));
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[360px,1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Doctor Queue</p>
              <h1 className="text-2xl font-semibold">Dermatology triage</h1>
            </div>
            <span className="rounded-full bg-clinic-amber/20 px-3 py-1 text-sm text-clinic-amber">
              {queue.length} active
            </span>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected?.id === item.id
                    ? "border-clinic-blue bg-clinic-blue/15"
                    : "border-white/10 bg-slate-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.provinceCode}</span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs">P{item.priorityScore}</span>
                </div>
                <p className="mt-3 text-sm text-white/80">{item.chiefComplaint}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/40">{item.status}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b1220] p-6">
          {selected ? (
            <>
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/40">Consultation</p>
                  <h2 className="mt-2 text-3xl font-semibold">{selected.id}</h2>
                  <p className="mt-2 max-w-2xl text-white/70">{selected.chiefComplaint}</p>
                </div>
                <button
                  type="button"
                  onClick={claimSelected}
                  className="rounded-2xl bg-clinic-blue px-5 py-3 font-medium text-white"
                >
                  Claim consultation
                </button>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                <div className="rounded-[1.5rem] bg-white/5 p-5">
                  <h3 className="text-lg font-medium">Clinical intake summary</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Metric label="Province" value={selected.provinceCode} />
                    <Metric label="Priority score" value={String(selected.priorityScore)} />
                    <Metric label="Workflow status" value={selected.status} />
                    <Metric label="Image count" value={String(selected.imageUrls.length)} />
                  </div>
                  <textarea
                    className="mt-5 min-h-40 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white"
                    defaultValue={"Assessment:\nLikely irritant dermatitis.\n\nPlan:\n- Review photos\n- Consider topical steroid\n- Advise trigger avoidance"}
                  />
                </div>

                <div className="rounded-[1.5rem] bg-gradient-to-br from-white/10 to-white/5 p-5">
                  <h3 className="text-lg font-medium">Prescription preview</h3>
                  <div className="mt-4 space-y-3">
                    <PrescriptionLine medication="Hydrocortisone 1% cream" instruction="Apply BID x 7 days" />
                    <PrescriptionLine medication="Cetirizine 10 mg" instruction="Take HS x 5 days" />
                  </div>
                  <button
                    type="button"
                    className="mt-6 w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-emerald-200"
                  >
                    Finalize e-Prescription
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-white/60">Loading queue...</div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">{label}</p>
      <p className="mt-2 text-lg font-medium">{value}</p>
    </div>
  );
}

function PrescriptionLine({ medication, instruction }: { medication: string; instruction: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="font-medium">{medication}</p>
      <p className="mt-1 text-sm text-white/70">{instruction}</p>
    </div>
  );
}

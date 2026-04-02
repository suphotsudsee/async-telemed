import { useState } from "react";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const provinceOptions = [
  { code: "10", label: "Bangkok" },
  { code: "50", label: "Chiang Mai" },
  { code: "83", label: "Phuket" }
];

const redFlagOptions = ["fever", "rapid-spread", "facial-swelling", "drug-reaction"];

export default function App() {
  const [thaiId, setThaiId] = useState("1101700203451");
  const [provinceCode, setProvinceCode] = useState("10");
  const [chiefComplaint, setChiefComplaint] = useState("Red itchy rash after new cosmetic product");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [selectedFlags, setSelectedFlags] = useState<string[]>(["rapid-spread"]);

  async function submitConsultation() {
    const response = await fetch(`${apiBase}/api/v1/consultations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "patient-demo-liff",
        provinceCode,
        chiefComplaint,
        symptomDurationDays: 3,
        redFlags: selectedFlags,
        imageUrls: ["https://example.com/mock-derm-image.jpg"]
      })
    });

    const payload = await response.json();
    setSubmittedId(payload.id);
  }

  function toggleFlag(flag: string) {
    setSelectedFlags((current) =>
      current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 text-brand-ink">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <section className="overflow-hidden rounded-[2rem] bg-brand-ink px-6 py-7 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-sky/70">LINE LIFF</p>
          <h1 className="mt-3 text-3xl font-semibold">Dermatology consult in a few minutes</h1>
          <p className="mt-3 text-sm text-white/80">
            Thai ID verified intake, image upload, and provincial doctor routing for asynchronous care.
          </p>
          <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Thai ID</span>
              <span>{thaiId}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>LIFF status</span>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">Connected</span>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-soft">
          <div className="mb-4">
            <p className="text-sm font-medium text-brand-leaf">Step 1</p>
            <h2 className="text-xl font-semibold">Patient intake</h2>
          </div>

          <label className="mb-3 block">
            <span className="mb-2 block text-sm text-slate-600">Thai Citizen ID</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={thaiId}
              onChange={(event) => setThaiId(event.target.value)}
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-2 block text-sm text-slate-600">Province</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={provinceCode}
              onChange={(event) => setProvinceCode(event.target.value)}
            >
              {provinceOptions.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm text-slate-600">Chief complaint</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={chiefComplaint}
              onChange={(event) => setChiefComplaint(event.target.value)}
            />
          </label>

          <div className="mb-5">
            <span className="mb-2 block text-sm text-slate-600">Red flags</span>
            <div className="flex flex-wrap gap-2">
              {redFlagOptions.map((flag) => {
                const active = selectedFlags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active ? "bg-brand-alert text-white" : "bg-brand-sky text-brand-ink"
                    }`}
                  >
                    {flag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-brand-leaf/40 bg-brand-leaf/5 p-4 text-sm text-slate-700">
            Image upload flow is wired for presigned URLs. In production this card is replaced by LIFF camera or gallery capture.
          </div>

          <button
            type="button"
            onClick={submitConsultation}
            className="mt-5 w-full rounded-2xl bg-brand-leaf px-4 py-3 font-medium text-white"
          >
            Submit consultation
          </button>
        </section>

        <section className="rounded-[2rem] bg-[#fff9f0] p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-leaf">Step 2</p>
              <h2 className="text-xl font-semibold">Case progress</h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm">SLA 4h</span>
          </div>

          <div className="mt-4 grid gap-3">
            {[
              "Identity verified",
              "Dermatology request submitted",
              "Provincial routing to doctor pool",
              "Doctor review and e-Prescription"
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-ink text-sm text-white">
                  {index + 1}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {submittedId ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Consultation created: {submittedId}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const metrics = [
  { label: "Open consultations", value: "124", tone: "bg-white" },
  { label: "First response breaches", value: "7", tone: "bg-ops-sand" },
  { label: "Completion breaches", value: "3", tone: "bg-rose-50" },
  { label: "Active provinces", value: "28", tone: "bg-ops-mint" }
];

const provinceRows = [
  { province: "Bangkok", open: 41, breached: 2, doctors: 9, sla: "94%" },
  { province: "Chiang Mai", open: 18, breached: 1, doctors: 4, sla: "92%" },
  { province: "Phuket", open: 9, breached: 0, doctors: 2, sla: "100%" },
  { province: "Khon Kaen", open: 14, breached: 2, doctors: 3, sla: "86%" }
];

export default function App() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] bg-ops-navy px-6 py-8 text-white shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">Operations</p>
              <h1 className="mt-3 text-4xl font-extrabold">SLA and routing dashboard</h1>
              <p className="mt-3 max-w-2xl text-white/75">
                Province-level visibility across intake load, breach risk, and doctor coverage for the dermatology pilot.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 px-5 py-4">
              <p className="text-sm text-white/60">Operating window</p>
              <p className="mt-1 text-2xl font-semibold">08:00-20:00 ICT</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className={`rounded-[1.75rem] ${metric.tone} p-5 shadow-lg`}>
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-3 text-4xl font-extrabold text-ops-navy">{metric.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <article className="rounded-[2rem] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ops-cyan">By province</p>
                <h2 className="text-2xl font-bold text-ops-navy">Routing performance</h2>
              </div>
              <button type="button" className="rounded-full bg-ops-cyan px-4 py-2 text-sm font-semibold text-white">
                Export SLA CSV
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-100">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Province</th>
                    <th className="px-4 py-3">Open</th>
                    <th className="px-4 py-3">Breaches</th>
                    <th className="px-4 py-3">Doctors</th>
                    <th className="px-4 py-3">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {provinceRows.map((row) => (
                    <tr key={row.province} className="border-t border-slate-100">
                      <td className="px-4 py-4 font-semibold text-ops-navy">{row.province}</td>
                      <td className="px-4 py-4">{row.open}</td>
                      <td className="px-4 py-4">{row.breached}</td>
                      <td className="px-4 py-4">{row.doctors}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-ops-mint px-3 py-1 font-semibold text-emerald-800">{row.sla}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-[2rem] bg-gradient-to-br from-ops-cyan to-sky-500 p-6 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Escalation Watch</p>
            <h2 className="mt-3 text-2xl font-bold">Breach risk in Bangkok cluster</h2>
            <div className="mt-6 space-y-4">
              {[
                "12 unclaimed cases older than 90 minutes",
                "Doctor capacity below target by 2 slots",
                "Recommend re-routing to adjacent provinces 11 and 12"
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

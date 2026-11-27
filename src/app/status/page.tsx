"use client";

import { card, PlainPage, Problem } from "@/components/ui/Plain";
import { useApi } from "@/components/ui/useApi";

type Status = { checkedAt: string; services: { name: string; ok: boolean; asleep?: boolean }[] };

export default function StatusPage() {
  const { data, problem } = useApi<Status>("/api/status");

  return (
    <PlainPage title="System status" intro="Checked live, about once a minute.">
      <Problem>{problem}</Problem>
      {!data && !problem && <p className="text-sm text-white/60">Checking…</p>}
      {data?.services.map((service) => (
        <div key={service.name} className={`${card} flex items-center justify-between gap-4`}>
          <span>{service.name}</span>
          <span className={`text-sm font-semibold ${service.ok ? "text-emerald-300" : service.asleep ? "text-amber-200" : "text-red-300"}`}>
            {service.ok ? "Working" : service.asleep ? "Asleep, starting up" : "Not responding"}
          </span>
        </div>
      ))}
      {data?.services.some((service) => service.asleep) && (
        <p className="text-sm text-white/70">Starting takes about a minute. If this stays the same for more than 5 minutes, the service has a problem.</p>
      )}
      {data && <p className="text-xs text-white/60">Last check {new Date(data.checkedAt).toLocaleString()}</p>}
    </PlainPage>
  );
}

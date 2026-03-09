import { z } from "zod";

// --- NCDR JSON Atom Feed entry schema ---

export const NcdrFeedEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  updated: z.string(),
  author: z.object({ name: z.string() }),
  link: z.object({
    "@rel": z.string(),
    "@href": z.string(),
  }),
  summary: z.object({
    "@type": z.string(),
    "#text": z.string(),
  }),
  category: z.object({ "@term": z.string() }),
  status: z.string(),
  msgType: z.string(),
  effective: z.string().optional(),
  expires: z.string().optional(),
});

export const NcdrFeedEntryArraySchema = z.array(NcdrFeedEntrySchema);

export type NcdrFeedEntry = z.infer<typeof NcdrFeedEntrySchema>;

// --- Parsed alert (from CAP XML) ---

export interface ActiveAlert {
  id: string;
  headline: string;
  description: string;
  instruction: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
  category: string;
  event: string;
  senderName: string;
  effective: string;
  expires: string;
  alertColor: string;
  areas: string[];
  geocodes: string[];
  web: string | undefined;
}

// --- Area filtering ---

export function filterAlertsByArea(
  alerts: ActiveAlert[],
  areaPrefixes: string[],
): ActiveAlert[] {
  return alerts.filter((alert) =>
    alert.geocodes.some((code) =>
      areaPrefixes.some((prefix) => code.startsWith(prefix)),
    ),
  );
}

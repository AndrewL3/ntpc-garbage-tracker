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
  web?: string;
}

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  // TODO: Implement inference engine
  // 1. Fetch live GPS from NTC API
  // 2. Read lastConfirmedStopRank from Redis
  // 3. Calculate PassEvents
  // 4. Write PassEvents to Supabase
  // 5. Update Redis state
  res.status(200).json({ ok: true, message: "sync stub" });
}

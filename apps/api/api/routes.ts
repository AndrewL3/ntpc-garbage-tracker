import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  // TODO: Read routes + stops + latest pass events from Supabase
  res.status(200).json({ ok: true, data: [] });
}

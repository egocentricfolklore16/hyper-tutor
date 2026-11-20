export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: 'network' | 'invalid' | 'rate' };

export async function submitWaitlistEmail(email: string, source: string): Promise<WaitlistResult> {
  void email;
  void source;
  // TODO: Replace with the existing Supabase client when its import path is configured.
  // Cloudflare Turnstile may be added here once the domain is linked.
  return { ok: true };
}

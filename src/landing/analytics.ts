export function track(eventName: string, props: Record<string, unknown> = {}): void {
  if (import.meta.env.DEV) console.debug('[analytics]', eventName, props);
}

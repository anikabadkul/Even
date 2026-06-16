export interface Capabilities {
  ai: boolean;
}

const DEFAULT_CAPABILITIES: Capabilities = { ai: false };

/** Asks the server proxy which optional integrations have keys configured; never exposes the keys themselves. */
export async function fetchCapabilities(): Promise<Capabilities> {
  try {
    const res = await fetch('/api/capabilities');
    if (!res.ok) return DEFAULT_CAPABILITIES;
    const data = await res.json();
    return { ai: Boolean(data?.ai) };
  } catch {
    return DEFAULT_CAPABILITIES;
  }
}

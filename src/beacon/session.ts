import { chromium, type BrowserContext, type APIRequestContext } from "playwright";

export interface BeaconSession {
  context: BrowserContext;
  /** Playwright's browser-context-bound request API: shares cookies with the logged-in session. */
  request: APIRequestContext;
  close: () => Promise<void>;
}

/**
 * Reuses the same persistent Chromium profile created by `beacon:discover`.
 * No credentials are extracted or stored separately — the session lives
 * entirely inside the gitignored browser profile directory, and API calls
 * are made through Playwright's context.request, which automatically
 * attaches the cookies from that logged-in session.
 */
export async function openBeaconSession(profileDir: string, headless: boolean): Promise<BeaconSession> {
  const context = await chromium.launchPersistentContext(profileDir, {
    headless,
    viewport: null,
  });
  return {
    context,
    request: context.request,
    close: () => context.close(),
  };
}

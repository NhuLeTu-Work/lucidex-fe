// Where the landing page's calls to action point.
//
// The standalone version was a closed page: every button was an in-page anchor.
// Inside the app the conversion paths are real routes, so they are collected
// here rather than being spread through the markup.

export const LANDING_ROUTES = {
  verify: '/verify',
  login: '/login',
  register: '/register',
} as const;

// TODO: these have no route in the app yet. Point them at real pages once they
// exist; until then the footer renders them as inert links, which is what the
// standalone page did via its `data-pending` attribute.
export const LANDING_PENDING_LINKS: Record<'contact' | 'privacy' | 'terms', string | null> = {
  contact: null,
  privacy: null,
  terms: null,
};

/**
 * Whether to show "Open app" instead of "Log in" / "Register".
 *
 * Deliberately the same check the previous `/` page used, so the landing page's
 * idea of "signed in" does not drift from the rest of the app.
 */
export function hasAccessToken(): boolean {
  try {
    return Boolean(localStorage.getItem('access_token'));
  } catch {
    // localStorage throws in some privacy modes; treat that as signed out.
    return false;
  }
}

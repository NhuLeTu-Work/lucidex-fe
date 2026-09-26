import { useEffect } from 'react';
import type { RefObject } from 'react';

import { FlightPathController } from './controllers/FlightPathController';
import { HeroVideoController } from './controllers/HeroVideoController';
import { LandingHeaderController } from './controllers/LandingHeaderController';
import { RoleIllustrationController } from './controllers/RoleIllustrationController';
import { VietnamLiquidMapController } from './controllers/VietnamLiquidMapController';
import { VietnamMap3DController } from './controllers/VietnamMap3DController';

/** Applied to <html> while the route is mounted; see landing.css. */
const HTML_ACTIVE_CLASS = 'lucidex-landing-active';

const FONT_MARKER = 'data-lucidex-landing-font';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Inter:wght@400;500;700;800;900&family=Michroma&display=swap';

const PAGE_TITLE = 'Vietnamese credentials Trusted worldwide';
const PAGE_DESCRIPTION = 'Verify any Vietnamese degree directly from the institution that issued it';

interface Disposable {
  destroy(): void;
}

function injectFonts(): () => void {
  // The standalone page loaded these from index.html and again via @import in
  // its stylesheet. Injecting them here keeps the request on this route only.
  const nodes: HTMLLinkElement[] = [];

  const preconnect = (href: string, crossOrigin?: string) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossOrigin !== undefined) link.crossOrigin = crossOrigin;
    link.setAttribute(FONT_MARKER, '');
    document.head.appendChild(link);
    nodes.push(link);
  };

  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com', '');

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = FONT_HREF;
  stylesheet.setAttribute(FONT_MARKER, '');
  document.head.appendChild(stylesheet);
  nodes.push(stylesheet);

  return () => nodes.forEach((node) => node.remove());
}

function applyDocumentMeta(): () => void {
  const previousTitle = document.title;
  document.title = PAGE_TITLE;

  let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  const createdMeta = meta === null;
  const previousDescription = meta?.content ?? null;

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = PAGE_DESCRIPTION;

  return () => {
    document.title = previousTitle;
    if (createdMeta) {
      meta?.remove();
    } else if (meta && previousDescription !== null) {
      meta.content = previousDescription;
    }
  };
}

function restoreScrollPosition(root: HTMLElement): void {
  // Run before the html class lands, so `scroll-behavior: smooth` is not in
  // effect yet and this is a jump rather than an animated scroll that the CTA
  // snapping would then fight.
  const hash = window.location.hash;
  if (hash.length > 1) {
    const target = root.querySelector(`#${CSS.escape(hash.slice(1))}`);
    if (target) {
      target.scrollIntoView();
      return;
    }
  }
  window.scrollTo(0, 0);
}

/**
 * Owns every side effect the landing page has: the <html> class carrying the
 * rules that cannot be scoped, the font links, the document title, and the
 * seven controllers ported from the standalone project.
 *
 * Nothing here may outlive the route. StrictMode runs this mount/unmount/mount
 * in development, which is the cheapest test that teardown is complete.
 */
export function useLandingRuntime(rootRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    restoreScrollPosition(root);

    document.documentElement.classList.add(HTML_ACTIVE_CLASS);
    const removeFonts = injectFonts();
    const restoreMeta = applyDocumentMeta();

    // Same construction order as the standalone page's initApp().
    const controllers: Disposable[] = [
      new LandingHeaderController(root),
      new HeroVideoController(root),
      new RoleIllustrationController(root),
      new FlightPathController(root),
      new VietnamLiquidMapController(root),
      new VietnamMap3DController(root),
    ];

    return () => {
      for (let i = controllers.length - 1; i >= 0; i -= 1) {
        controllers[i].destroy();
      }
      restoreMeta();
      removeFonts();
      document.documentElement.classList.remove(HTML_ACTIVE_CLASS);
    };
  }, [rootRef]);
}

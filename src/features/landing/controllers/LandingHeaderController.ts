// Ported from the standalone landing page's main.ts (HeaderController).
// Behaviour is unchanged. The differences are all about living inside an SPA:
//   - every lookup is scoped to the landing root, so the document-wide
//     `a[href="#..."]` query can no longer reach the rest of the app,
//   - handlers are named fields instead of inline closures so they can be
//     removed, including the two on `document`,
//   - the body scroll-lock class is namespaced and always released on destroy,
//   - pending footer links are rendered from links.ts by the footer component
//     instead of being rewritten here.

const MENU_OPEN_CLASS = 'lucidex-landing-menu-open';

export class LandingHeaderController {
  private root: HTMLElement;
  private header: HTMLElement | null = null;
  private menuBtn: HTMLButtonElement | null = null;
  private menuDropdown: HTMLElement | null = null;
  private isMenuOpen = false;
  private isShrunk = false;
  private scrollTicking = false;

  private spySections: { id: string; element: HTMLElement | null; links: HTMLAnchorElement[] }[] = [];
  private dropdownLinks: HTMLAnchorElement[] = [];
  private rafId: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.header = root.querySelector<HTMLElement>('#site-header');
    this.menuBtn = root.querySelector<HTMLButtonElement>('#mobile-menu-btn');
    this.menuDropdown = root.querySelector<HTMLElement>('#mobile-menu-dropdown');

    if (!this.header) return;

    this.initScrollSpy();
    this.initMobileMenu();
    this.initScroll();
  }

  private initScrollSpy(): void {
    // Nav links: "Problem" -> #problem, "How it works" -> #issuer, "Nationwide" -> #national
    const sections = ['problem', 'issuer', 'national'];
    this.spySections = sections.map(id => {
      const el = this.root.querySelector<HTMLElement>(`#${id}`);
      const links = Array.from(this.root.querySelectorAll<HTMLAnchorElement>(`a[href="#${id}"]`));
      return { id, element: el, links };
    });
  }

  private initScroll(): void {
    window.addEventListener('scroll', this.onScrollEvent, { passive: true });

    // Initial check
    this.onScroll();
  }

  private onScrollEvent = (): void => {
    if (!this.scrollTicking) {
      this.rafId = window.requestAnimationFrame(() => {
        this.rafId = null;
        this.onScroll();
        this.scrollTicking = false;
      });
      this.scrollTicking = true;
    }
  };

  private onScroll(): void {
    const scrollY = window.scrollY;

    // After scrolling more than 80px, the pill shrinks to width min(760px, 100% - 32px) and moves to top 10px
    const shouldShrink = scrollY > 80;
    if (shouldShrink !== this.isShrunk && this.header) {
      this.isShrunk = shouldShrink;
      this.header.classList.toggle('is-shrunk', shouldShrink);
    }

    // Scroll-spy: set aria-current="true" on the link whose section is currently at 45% of the viewport height
    const vh = window.innerHeight;
    const targetY = vh * 0.45;
    let activeId: string | null = null;

    for (const item of this.spySections) {
      if (!item.element) continue;
      const rect = item.element.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom > targetY) {
        activeId = item.id;
        break;
      }
    }

    for (const item of this.spySections) {
      const isActive = item.id === activeId;
      for (const link of item.links) {
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    }
  }

  private onMenuBtnClick = (e: MouseEvent): void => {
    e.stopPropagation();
    if (this.isMenuOpen) {
      this.closeMenu(true);
    } else {
      this.openMenu();
    }
  };

  private onDropdownLinkClick = (): void => {
    this.closeMenu(true);
  };

  private onDocumentClick = (e: MouseEvent): void => {
    if (!this.isMenuOpen) return;
    const target = e.target as Node | null;
    if (target && !this.header?.contains(target)) {
      this.closeMenu(true);
    }
  };

  private onDocumentKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isMenuOpen) {
      this.closeMenu(true);
    }
  };

  private initMobileMenu(): void {
    if (!this.menuBtn || !this.menuDropdown) return;

    // Toggle on button click
    this.menuBtn.addEventListener('click', this.onMenuBtnClick);

    // Close on dropdown link tap
    this.dropdownLinks = Array.from(this.menuDropdown.querySelectorAll('a'));
    this.dropdownLinks.forEach(link => {
      link.addEventListener('click', this.onDropdownLinkClick);
    });

    // Close on outside click
    document.addEventListener('click', this.onDocumentClick);

    // Close on Escape key
    document.addEventListener('keydown', this.onDocumentKeydown);
  }

  private openMenu(): void {
    if (!this.menuBtn || !this.menuDropdown) return;
    this.isMenuOpen = true;
    this.menuBtn.setAttribute('aria-expanded', 'true');
    this.menuBtn.setAttribute('aria-label', 'Close menu');
    this.menuDropdown.hidden = false;
    document.body.classList.add(MENU_OPEN_CLASS);
  }

  private closeMenu(returnFocus = false): void {
    if (!this.isMenuOpen || !this.menuBtn || !this.menuDropdown) return;
    this.isMenuOpen = false;
    this.menuBtn.setAttribute('aria-expanded', 'false');
    this.menuBtn.setAttribute('aria-label', 'Open menu');
    this.menuDropdown.hidden = true;
    document.body.classList.remove(MENU_OPEN_CLASS);

    if (returnFocus) {
      this.menuBtn.focus();
    }
  }

  public destroy(): void {
    window.removeEventListener('scroll', this.onScrollEvent);
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('keydown', this.onDocumentKeydown);
    this.menuBtn?.removeEventListener('click', this.onMenuBtnClick);
    this.dropdownLinks.forEach(link => {
      link.removeEventListener('click', this.onDropdownLinkClick);
    });
    this.dropdownLinks = [];

    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Leaving the route with the menu open would otherwise scroll-lock the
    // whole app for good.
    document.body.classList.remove(MENU_OPEN_CLASS);

    this.spySections = [];
    this.header = null;
    this.menuBtn = null;
    this.menuDropdown = null;
  }
}

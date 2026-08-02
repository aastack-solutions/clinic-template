/** Keyboard users land here first and can jump straight past the navigation. */
export function SkipLink({ href = '#main', children = 'Skip to content' }: { href?: string; children?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-btn focus:bg-primary-800 focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-on-primary focus:shadow-[var(--shadow-lift)]"
    >
      {children}
    </a>
  );
}

import React, { useMemo } from 'react';

const footerLinks = [
  { href: 'https://github.com/pokelitee/pogo-calendar', text: 'App Source' },
  { href: 'https://leekduck.com/events/', text: 'Data Source' },
  { href: 'https://github.com/pokelitee/leak-duck', text: 'Scraper Source' },
  { href: 'https://github.com/pokelitee/pogo-calendar/issues', text: 'Send Feedback' },
];

const FooterLink = React.memo(function FooterLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground hover:underline"
    >
      {text}
    </a>
  );
});

function FooterComponent() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="border-t border-border bg-card/80 px-4 py-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-4">
          {footerLinks.map((link, i) => (
            <React.Fragment key={link.href}>
              {i > 0 && <span className="h-3.5 w-px bg-border" aria-hidden="true" />}
              <FooterLink href={link.href} text={link.text} />
            </React.Fragment>
          ))}
        </div>

        <div className="max-w-[550px] opacity-70">
          <p className="mb-1 text-xs">
            Built with React, TypeScript, and Tailwind CSS. Fan project not affiliated with Niantic,
            Inc.
          </p>
          <p className="text-xs">© {currentYear} PoGo Calendar</p>
        </div>
      </div>
    </footer>
  );
}

const Footer = React.memo(FooterComponent);
Footer.displayName = 'Footer';
export default Footer;

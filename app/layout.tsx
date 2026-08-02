import type { Metadata, Viewport } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { FloatingActions } from '@/components/layout/FloatingActions';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SkipLink } from '@/components/layout/SkipLink';
import { clinic, getNavItems } from '@/lib/clinic';
import { resolveFonts } from '@/lib/fonts';
import { buildJsonLd } from '@/lib/jsonld';
import { buildMetadata } from '@/lib/seo';
import { browserThemeColor, buildThemeCss } from '@/lib/theme';
import { formatAddress, formatHours, resolveCta, telHref, whatsappHref } from '@/lib/utils';

import './globals.css';

export const metadata: Metadata = buildMetadata(clinic);

export const viewport: Viewport = {
  themeColor: browserThemeColor(clinic.theme),
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = resolveFonts(clinic.theme);
  const navItems = getNavItems(clinic);
  const headerCta = resolveCta(clinic.header.cta, clinic);
  const phone = clinic.contact.phones[0]?.number;
  const openHours = clinic.contact.hours.find((entry) => !entry.closed);

  return (
    <html lang={clinic.seo.language} className={fonts.classNames} suppressHydrationWarning>
      <head>
        {/*
          The entire visual identity — brand ramps, radii and font bindings —
          is inlined here from clinic.json. It ships in the first HTML byte, so
          there is no theming flash and no client-side theme runtime.
        */}
        <style dangerouslySetInnerHTML={{ __html: buildThemeCss(clinic.theme) + fonts.css }} />
      </head>
      <body className="min-h-dvh antialiased">
        <SkipLink />

        <Header
          name={clinic.clinic.name}
          tagline={clinic.clinic.tagline}
          logo={clinic.clinic.logo?.light}
          navItems={navItems}
          cta={headerCta}
          phone={phone}
          topbar={clinic.header.topbar?.enabled ? clinic.header.topbar : undefined}
          hoursSummary={openHours ? `${openHours.days} · ${formatHours(openHours)}` : undefined}
          address={formatAddress(clinic.contact.address)}
          socials={clinic.social}
          sticky={clinic.layout.stickyHeader}
        />

        <main id="main">{children}</main>

        <Footer clinic={clinic} />

        {clinic.layout.showFloatingActions ? (
          <FloatingActions
            whatsappHref={
              clinic.contact.whatsapp?.floatingButton
                ? whatsappHref(clinic.contact.whatsapp.number, clinic.contact.whatsapp.defaultMessage)
                : undefined
            }
            phoneHref={phone ? telHref(phone) : undefined}
            whatsappLabel={`Chat with ${clinic.clinic.name} on WhatsApp`}
          />
        ) : null}

        <JsonLd data={buildJsonLd(clinic)} />
      </body>
    </html>
  );
}

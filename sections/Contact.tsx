import { Clock, Mail, MapPin, MessageCircle, Phone, TriangleAlert } from 'lucide-react';

import { ContactForm } from '@/components/contact/ContactForm';
import { CtaGroup } from '@/components/ui/Button';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import {
  cn,
  directionsHref,
  formatAddress,
  formatHours,
  hasItems,
  mailHref,
  resolveCtas,
  telHref,
  whatsappHref,
} from '@/lib/utils';

import type { SectionProps } from './types';

/**
 * The practical half of the page: everything a patient needs to get in touch,
 * paired with the appointment form. Each channel block appears only if the
 * clinic provides it, so a practice with no WhatsApp or no email simply shows
 * fewer, evenly spaced cards.
 */
export function Contact({ clinic, tone }: SectionProps) {
  const { contact } = clinic;
  const address = formatAddress(contact.address);
  const directions = directionsHref(clinic);
  const ctas = resolveCtas(contact.ctas, clinic);
  const showForm = contact.form?.enabled && hasItems(contact.form.fields);

  return (
    <Section id="contact" tone={tone} ariaLabel={contact.title ? undefined : contact.navLabel ?? 'Contact us'}>
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div>
          {contact.eyebrow ? <Eyebrow>{contact.eyebrow}</Eyebrow> : null}

          {contact.title ? (
            <Reveal>
              <h2
                id="contact-title"
                className="mt-5 font-display text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] leading-[1.08] font-medium text-ink"
              >
                {contact.title}
              </h2>
            </Reveal>
          ) : null}

          {contact.description ? (
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink/65">{contact.description}</p>
            </Reveal>
          ) : null}

          <Stagger as="ul" className="mt-10 flex flex-col gap-4">
            {hasItems(contact.phones) ? (
              <ContactCard icon={Phone} title="Call us">
                <ul className="flex flex-col gap-1.5">
                  {contact.phones.map((phone) => (
                    <li key={phone.number}>
                      <a
                        href={telHref(phone.number)}
                        className="font-medium text-ink transition-colors hover:text-primary-800"
                      >
                        {phone.number}
                      </a>
                      {phone.label ? <span className="ml-2 text-sm text-ink/50">{phone.label}</span> : null}
                    </li>
                  ))}
                </ul>
              </ContactCard>
            ) : null}

            {contact.whatsapp ? (
              <ContactCard icon={MessageCircle} title="WhatsApp">
                <a
                  href={whatsappHref(contact.whatsapp.number, contact.whatsapp.defaultMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink transition-colors hover:text-primary-800"
                >
                  Message us on WhatsApp
                </a>
              </ContactCard>
            ) : null}

            {hasItems(contact.emails) ? (
              <ContactCard icon={Mail} title="Email">
                <ul className="flex flex-col gap-1.5">
                  {contact.emails.map((entry) => (
                    <li key={entry.address}>
                      <a
                        href={mailHref(entry.address)}
                        className="font-medium break-all text-ink transition-colors hover:text-primary-800"
                      >
                        {entry.address}
                      </a>
                      {entry.label ? <span className="ml-2 text-sm text-ink/50">{entry.label}</span> : null}
                    </li>
                  ))}
                </ul>
              </ContactCard>
            ) : null}

            {address ? (
              <ContactCard icon={MapPin} title="Visit">
                <p className="leading-relaxed text-ink">{address}</p>
                {directions ? (
                  <a
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-sm font-medium text-primary-800 hover:text-primary-950"
                  >
                    Get directions
                  </a>
                ) : null}
              </ContactCard>
            ) : null}

            {hasItems(contact.hours) ? (
              <ContactCard icon={Clock} title="Opening hours">
                <ul className="flex flex-col gap-2">
                  {contact.hours.map((entry) => (
                    <li
                      key={entry.days}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 border-b border-ink/6 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-ink/75">{entry.days}</span>
                      <span
                        className={cn(
                          'text-sm tabular-nums',
                          entry.closed ? 'text-ink/40' : 'font-medium text-ink',
                        )}
                      >
                        {formatHours(entry)}
                      </span>
                    </li>
                  ))}
                </ul>
              </ContactCard>
            ) : null}
          </Stagger>

          {contact.emergencyNote ? (
            <Reveal delay={0.1}>
              <p className="mt-6 flex items-start gap-3 rounded-card border border-accent-300/40 bg-accent-50/60 p-5 text-sm leading-relaxed text-ink/70">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent-700" aria-hidden="true" />
                {contact.emergencyNote}
              </p>
            </Reveal>
          ) : null}

          {ctas.length > 0 ? <CtaGroup ctas={ctas} size="md" className="mt-8" /> : null}
        </div>

        {showForm && contact.form ? (
          <Reveal direction="left" delay={0.06}>
            <div className="rounded-panel border border-ink/8 bg-surface p-7 shadow-[var(--shadow-lift)] sm:p-10">
              {contact.form.title ? (
                <h3 className="font-display text-2xl leading-snug font-medium text-ink">{contact.form.title}</h3>
              ) : null}
              {contact.form.description ? (
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">{contact.form.description}</p>
              ) : null}

              <div className={cn(contact.form.title || contact.form.description ? 'mt-8' : '')}>
                <ContactForm
                  config={contact.form}
                  clinicName={clinic.clinic.name}
                  whatsappNumber={contact.whatsapp?.number}
                  email={contact.emails[0]?.address}
                />
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}

function ContactCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <StaggerItem as="li">
      <div className="flex gap-4 rounded-card border border-ink/8 bg-surface p-5 shadow-[var(--shadow-soft)] transition-colors duration-300 hover:border-primary-700/20 sm:p-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-800">
          <Icon className="size-[1.15rem]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-ink/40 uppercase">{title}</p>
          <div className="mt-2 text-[0.9375rem]">{children}</div>
        </div>
      </div>
    </StaggerItem>
  );
}

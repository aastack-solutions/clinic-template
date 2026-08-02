import { GraduationCap, Languages } from 'lucide-react';

import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/lib/icons';
import { cn, resolveCta, resolveCtas } from '@/lib/utils';
import type { Clinic, Doctor } from '@/types/clinic';

import { CtaGroup } from '@/components/ui/Button';
import { hoverLift, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * The team. Portraits are the emotional core of a clinic site, so cards lead with
 * a tall image and reveal credentials on hover — while every credential also stays
 * in the DOM for screen readers and on touch devices, where hover does not exist.
 */
export function Doctors({ clinic, tone }: SectionProps) {
  const doctors = clinic.doctors;
  if (!doctors || doctors.items.length === 0) return null;

  const ctas = resolveCtas(doctors.ctas, clinic);
  const count = doctors.items.length;

  return (
    <Section id="team" tone={tone} ariaLabel={doctors.title ? undefined : doctors.navLabel ?? 'Our team'}>
      <SectionHeading
        id="team"
        eyebrow={doctors.eyebrow}
        title={doctors.title}
        description={doctors.description}
        className="mb-14 lg:mb-18"
      />

      <Stagger
        as="ul"
        className={cn(
          'grid gap-7 sm:grid-cols-2',
          count === 1 && 'mx-auto max-w-md sm:grid-cols-1',
          count === 2 && 'mx-auto max-w-3xl',
          count >= 3 && 'lg:grid-cols-3',
          count >= 4 && count % 4 === 0 && 'xl:grid-cols-4',
        )}
      >
        {doctors.items.map((doctor) => (
          <StaggerItem as="li" key={doctor.id} className="h-full">
            <DoctorCard doctor={doctor} clinic={clinic} />
          </StaggerItem>
        ))}
      </Stagger>

      {ctas.length > 0 ? <CtaGroup ctas={ctas} size="md" className="mt-14 justify-center" /> : null}
    </Section>
  );
}

function DoctorCard({ doctor, clinic }: { doctor: Doctor; clinic: Clinic }) {
  const cta = resolveCta(doctor.cta, clinic);

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-panel border border-ink/8 bg-surface',
        'shadow-[var(--shadow-soft)]',
        hoverLift,
        'hover:border-primary-700/20',
      )}
    >
      <div className="relative">
        <SmartImage
          image={doctor.image}
          alt={doctor.name}
          ratio="aspect-4/5"
          rounded="rounded-none"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 340px"
          fallbackInitials
          zoomOnHover
        />

        {doctor.experienceYears ? (
          <span className="absolute top-4 left-4 rounded-pill bg-surface/90 px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] text-primary-900 uppercase backdrop-blur-sm">
            {doctor.experienceYears}+ yrs
          </span>
        ) : null}

        {doctor.socials.length > 0 ? (
          <ul
            className={cn(
              'absolute right-4 bottom-4 flex gap-2',
              'translate-y-2 opacity-0 transition-all duration-500',
              'group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100',
              // Touch devices never fire hover — keep the links visible there.
              'max-md:translate-y-0 max-md:opacity-100',
            )}
          >
            {doctor.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.platform];
              return (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${doctor.name} on ${SOCIAL_LABELS[social.platform] ?? social.platform}`}
                    className="grid size-9 place-items-center rounded-full bg-surface/90 text-ink/70 backdrop-blur-sm transition-colors hover:bg-primary-700 hover:text-on-primary"
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-xl leading-snug font-medium text-ink">{doctor.name}</h3>

        {doctor.role ? <p className="mt-1.5 text-sm font-medium text-primary-800">{doctor.role}</p> : null}

        {doctor.credentials ? (
          <p className="mt-2 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink/50">
            <GraduationCap className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {doctor.credentials}
          </p>
        ) : null}

        {doctor.bio ? (
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/60">{doctor.bio}</p>
        ) : null}

        {doctor.specialties.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {doctor.specialties.map((specialty) => (
              <li
                key={specialty}
                className="rounded-pill bg-primary-50 px-3 py-1.5 text-[0.75rem] font-medium text-primary-900"
              >
                {specialty}
              </li>
            ))}
          </ul>
        ) : null}

        {doctor.languages.length > 0 ? (
          <p className="mt-5 flex items-center gap-2 text-[0.8125rem] text-ink/50">
            <Languages className="size-4 shrink-0" aria-hidden="true" />
            {doctor.languages.join(' · ')}
          </p>
        ) : null}

        {cta ? (
          <a
            href={cta.href}
            {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-6 text-sm font-medium text-primary-800 transition-colors hover:text-primary-950"
          >
            <span className="sr-only">{doctor.name}: </span>
            {cta.label}
          </a>
        ) : null}
      </div>
    </article>
  );
}

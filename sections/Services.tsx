import { ArrowUpRight, Check, Clock } from 'lucide-react';

import { getIcon } from '@/lib/icons';
import { cn, resolveCta, resolveCtas } from '@/lib/utils';
import type { Clinic, Service } from '@/types/clinic';

import { CtaGroup } from '@/components/ui/Button';
import { hoverLift, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { SmartImage } from '@/components/ui/SmartImage';

import type { SectionProps } from './types';

/**
 * Treatment grid. Services flagged `featured` become wide, image-led cards that
 * anchor the grid; the rest are compact icon cards. The mix means a clinic with
 * four services and a clinic with twenty both get a well-proportioned section.
 */
export function Services({ clinic, tone }: SectionProps) {
  const services = clinic.services;
  if (!services || services.items.length === 0) return null;

  const ctas = resolveCtas(services.ctas, clinic);
  const featured = services.items.filter((item) => item.featured);
  const standard = services.items.filter((item) => !item.featured);

  return (
    <Section
      id="services"
      tone={tone}
      ariaLabel={services.title ? undefined : services.navLabel ?? 'Our services'}
    >
      <SectionHeading
        id="services"
        eyebrow={services.eyebrow}
        title={services.title}
        description={services.description}
        align="center"
        className="mb-14 lg:mb-18"
      />

      {featured.length > 0 ? (
        <Stagger className="mb-6 grid gap-6 lg:grid-cols-2">
          {featured.map((service) => (
            <StaggerItem key={service.id}>
              <FeaturedServiceCard service={service} clinic={clinic} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}

      {standard.length > 0 ? (
        <Stagger as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {standard.map((service) => (
            <StaggerItem as="li" key={service.id} className="h-full">
              <ServiceCard service={service} clinic={clinic} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}

      {ctas.length > 0 ? <CtaGroup ctas={ctas} size="md" className="mt-14 justify-center" /> : null}
    </Section>
  );
}

function ServiceCard({ service, clinic }: { service: Service; clinic: Clinic }) {
  const Icon = getIcon(service.icon);
  const cta = resolveCta(service.cta, clinic);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-card border border-ink/8 bg-surface p-7 sm:p-8',
        'shadow-[var(--shadow-soft)]',
        hoverLift,
        'hover:border-primary-700/25',
      )}
    >
      <span className="grid size-12 place-items-center rounded-[0.9rem] bg-primary-50 text-primary-800 transition-colors duration-500 group-hover:bg-primary-700 group-hover:text-on-primary">
        <Icon className="size-[1.35rem]" aria-hidden="true" />
      </span>

      <h3 className="mt-6 font-display text-xl leading-snug font-medium text-ink">{service.title}</h3>

      {service.description ? (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">{service.description}</p>
      ) : null}

      {service.features.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-2.5">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-ink/65">
              <Check className="mt-0.5 size-4 shrink-0 text-primary-700" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}

      <ServiceMeta service={service} className="mt-auto pt-6" />

      {cta ? (
        <p className="mt-5">
          {/* Stretched link: the whole card is clickable, but only one accessible
              name is exposed and the markup stays a valid <article>. */}
          <a
            href={cta.href}
            {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 before:absolute before:inset-0 before:rounded-card before:content-[''] hover:text-primary-950"
          >
            <span className="sr-only">{service.title}: </span>
            {cta.label}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </p>
      ) : null}
    </article>
  );
}

function FeaturedServiceCard({ service, clinic }: { service: Service; clinic: Clinic }) {
  const Icon = getIcon(service.icon);
  const cta = resolveCta(service.cta, clinic);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-panel border border-ink/8 bg-surface',
        'shadow-[var(--shadow-soft)]',
        hoverLift,
        'hover:border-primary-700/25 sm:flex-row',
      )}
    >
      <SmartImage
        image={service.image}
        alt={service.title}
        ratio="aspect-[16/10] sm:aspect-auto"
        rounded="rounded-none"
        sizes="(max-width: 640px) 92vw, 300px"
        fallbackIcon={service.icon ?? 'Sparkles'}
        zoomOnHover
        className="sm:h-auto sm:w-[42%] sm:shrink-0 sm:self-stretch"
      />

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-accent-100/70 px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.14em] text-accent-900 uppercase">
          <Icon className="size-3.5" aria-hidden="true" />
          Signature
        </span>

        <h3 className="mt-4 font-display text-2xl leading-snug font-medium text-ink">{service.title}</h3>

        {service.description ? (
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">{service.description}</p>
        ) : null}

        {service.features.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {service.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-ink/65">
                <Check className="size-4 shrink-0 text-primary-700" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}

        <ServiceMeta service={service} className="mt-auto pt-6" />

        {cta ? (
          <a
            href={cta.href}
            {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary-800 hover:text-primary-950"
          >
            {cta.label}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

/** Price / duration strip — rendered only when the clinic supplies either. */
function ServiceMeta({ service, className }: { service: Service; className?: string }) {
  if (!service.price && !service.duration) return null;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-ink/8 pt-5', className)}>
      {service.price ? (
        <p className="text-sm text-ink/55">
          <span className="font-display text-lg font-medium text-ink">{service.price.from}</span>
          {service.price.note ? <span className="ml-2">{service.price.note}</span> : null}
        </p>
      ) : null}
      {service.duration ? (
        <p className="flex items-center gap-1.5 text-sm text-ink/55">
          <Clock className="size-4" aria-hidden="true" />
          {service.duration}
        </p>
      ) : null}
    </div>
  );
}

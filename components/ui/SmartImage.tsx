'use client';

import Image from 'next/image';
import { useState } from 'react';

import { getOptionalIcon } from '@/lib/icons';
import { cn, initials } from '@/lib/utils';
import type { ClinicImage } from '@/types/clinic';

type SmartImageProps = {
  image?: ClinicImage | null;
  /** Used when the content file omits `alt`, and to seed the placeholder. */
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Aspect-ratio utility applied to the wrapper, e.g. `aspect-[4/5]`. */
  ratio?: string;
  rounded?: string;
  /** Icon name shown in the placeholder when there is no usable image. */
  fallbackIcon?: string;
  /** Show the subject's initials in the placeholder (used for people). */
  fallbackInitials?: boolean;
  /** Gentle zoom when the parent card is hovered. */
  zoomOnHover?: boolean;
};

/**
 * Every image in the engine goes through here.
 *
 * Clinic content is user-supplied, so an image may be missing entirely or point
 * at a URL that no longer resolves. In both cases this renders a branded
 * placeholder instead of a broken-image icon, which keeps a half-populated
 * `clinic.json` looking deliberate rather than unfinished.
 */
export function SmartImage({
  image,
  alt,
  className,
  imageClassName,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px',
  priority = false,
  ratio,
  rounded = 'rounded-card',
  fallbackIcon,
  fallbackInitials = false,
  zoomOnHover = false,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const Icon = getOptionalIcon(fallbackIcon);
  const showPlaceholder = !image?.src || failed;

  return (
    <div className={cn('relative isolate overflow-hidden bg-primary-50', rounded, ratio, className)}>
      {showPlaceholder ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary-100 via-primary-50 to-accent-100/60"
          role="img"
          aria-label={alt}
        >
          {fallbackInitials ? (
            <span className="font-display text-4xl font-medium text-primary-800/45 sm:text-5xl">
              {initials(alt)}
            </span>
          ) : Icon ? (
            <Icon className="size-10 text-primary-700/35" aria-hidden="true" />
          ) : (
            <span className="size-16 rounded-full bg-primary-200/40" aria-hidden="true" />
          )}
        </div>
      ) : (
        <Image
          src={image.src}
          alt={image.alt?.trim() || alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          placeholder={image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={image.blurDataURL}
          onError={() => setFailed(true)}
          className={cn(
            'object-cover',
            zoomOnHover && 'transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]',
            imageClassName,
          )}
        />
      )}
    </div>
  );
}

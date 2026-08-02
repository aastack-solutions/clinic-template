import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** `wide` for full-bleed compositions, `narrow` for reading-width copy. */
  size?: 'narrow' | 'default' | 'wide';
};

const SIZES = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[92rem]',
} as const;

/**
 * The single horizontal rhythm of the site. Gutters grow with the viewport so
 * content never touches the edge on mobile and never feels cramped on 4K.
 */
export function Container({ children, className, as: Tag = 'div', size = 'default' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-12', SIZES[size], className)}>{children}</Tag>
  );
}

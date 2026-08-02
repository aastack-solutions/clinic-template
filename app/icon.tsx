import { ImageResponse } from 'next/og';

import { clinic } from '@/lib/clinic';
import { readableForeground } from '@/lib/theme';
import { initials } from '@/lib/utils';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * The favicon is generated from the clinic's name and brand colour, so swapping
 * `clinic.json` also swaps the browser-tab mark. Drop a `clinic.logo.icon` into
 * the content file to override this with real artwork.
 */
export default function Icon() {
  const background = clinic.theme.colors.primary;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background,
          color: readableForeground(background),
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          borderRadius: 14,
        }}
      >
        {initials(clinic.clinic.name)}
      </div>
    ),
    size,
  );
}

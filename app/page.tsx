import { clinic, getSectionOrder, getSectionTones } from '@/lib/clinic';
import { SECTION_COMPONENTS } from '@/sections/registry';

/**
 * The whole homepage.
 *
 * There is no clinic-specific markup here and no fixed list of sections: the
 * order comes from `layout.sections` in the content file, sections without data
 * are filtered out before they ever render, and the alternating background
 * rhythm is computed from whatever survives that filter.
 */
export default function HomePage() {
  const order = getSectionOrder(clinic);
  const tones = getSectionTones(clinic);

  return (
    <>
      {order.map((key) => {
        const SectionComponent = SECTION_COMPONENTS[key];
        return <SectionComponent key={key} clinic={clinic} tone={tones[key] ?? 'surface'} />;
      })}
    </>
  );
}

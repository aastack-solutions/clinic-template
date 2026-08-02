import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { clinic } from '@/lib/clinic';
import { telHref } from '@/lib/utils';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  const phone = clinic.contact.phones[0]?.number;

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-primary-700 uppercase">Error 404</p>

      <h1 className="mt-6 font-display text-[clamp(2.2rem,1.4rem+3vw,3.6rem)] leading-[1.05] font-medium text-ink">
        We couldn’t find that page
      </h1>

      <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink/60">
        The page may have moved. You can head back to the homepage, or call us and we’ll point you in the
        right direction.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button href="/" size="lg" icon="ArrowRight">
          Back to homepage
        </Button>
        {phone ? (
          <Button href={telHref(phone)} variant="outline" size="lg" icon="Phone" iconPosition="left">
            {phone}
          </Button>
        ) : null}
      </div>
    </Container>
  );
}

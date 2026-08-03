'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';

import { cn, mailHref, whatsappHref } from '@/lib/utils';
import type { Contact } from '@/types/clinic';

import { Button } from '@/components/ui/Button';

type FormConfig = NonNullable<Contact['form']>;

type ContactFormProps = {
  config: FormConfig;
  clinicName: string;
  whatsappNumber?: string;
  email?: string;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Appointment request form.
 *
 * Deliberately backend-free by default: submissions are composed into a WhatsApp
 * message or a mailto draft, which is what most independent clinics actually use
 * and means a new site works the moment the JSON is swapped. Set
 * `contact.form.mode` to `endpoint` to POST JSON to a CRM instead.
 *
 * Validation is native-first (`required`, `type="email"`) with a JS layer on top
 * that moves focus to the first invalid field and links errors via
 * `aria-describedby`.
 */
export function ContactForm({ config, clinicName, whatsappNumber, email }: ContactFormProps) {
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fields = config.fields;

  const setValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = (values[field.name] ?? '').trim();
      if (field.required && !value) {
        nextErrors[field.name] = `${field.label} is required.`;
        continue;
      }
      if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        nextErrors[field.name] = 'Enter a valid email address.';
      }
      if (value && field.type === 'tel' && value.replace(/\D/g, '').length < 7) {
        nextErrors[field.name] = 'Enter a valid phone number.';
      }
    }

    setErrors(nextErrors);

    const firstInvalid = fields.find((field) => nextErrors[field.name]);
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid.name}`)?.focus();
    }

    return Object.keys(nextErrors).length === 0;
  };

  const composeMessage = () =>
    [
      `New appointment request for ${clinicName}`,
      '',
      ...fields
        .map((field) => {
          const value = (values[field.name] ?? '').trim();
          return value ? `${field.label}: ${value}` : null;
        })
        .filter((line): line is string => line !== null),
    ].join('\n');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting') return;
    if (!validate()) return;

    setErrorMessage(null);

    try {
      if (config.mode === 'endpoint') {
        if (!config.endpointUrl) throw new Error('No endpoint configured.');
        setStatus('submitting');
        const response = await fetch(config.endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinic: clinicName, ...values }),
        });
        if (!response.ok) throw new Error(`Request failed (${response.status}).`);
      } else if (config.mode === 'whatsapp') {
        if (!whatsappNumber) throw new Error('No WhatsApp number configured.');
        window.open(whatsappHref(whatsappNumber, composeMessage()), '_blank', 'noopener,noreferrer');
      } else {
        if (!email) throw new Error('No email address configured.');
        window.location.href = mailHref(email, `Appointment request for ${clinicName}`, composeMessage());
      }

      setStatus('success');
      setValues({});
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please call us instead.',
      );
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-start gap-5 rounded-card border border-primary-200 bg-primary-50/60 p-8 sm:p-10"
      >
        <span className="grid size-12 place-items-center rounded-full bg-primary-700 text-on-primary">
          <CircleCheck className="size-6" aria-hidden="true" />
        </span>
        <p className="font-display text-xl leading-snug font-medium text-primary-950">{config.successMessage}</p>
        <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
          Send another request
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const id = `${formId}-${field.name}`;
          const error = errors[field.name];
          const describedBy = error ? `${id}-error` : undefined;
          const shared = {
            id,
            name: field.name,
            required: field.required,
            'aria-invalid': error ? (true as const) : undefined,
            'aria-describedby': describedBy,
            value: values[field.name] ?? '',
            className: cn(
              'w-full rounded-btn border bg-surface px-4 py-3 text-[0.9375rem] text-ink',
              'placeholder:text-ink/35 transition-colors duration-300',
              'focus:border-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25',
              error ? 'border-red-400' : 'border-ink/12 hover:border-ink/25',
            ),
          };

          return (
            <div key={field.name} className={cn('flex flex-col gap-2', field.span === 'full' && 'sm:col-span-2')}>
              <label htmlFor={id} className="text-sm font-medium text-ink/75">
                {field.label}
                {field.required ? (
                  <span className="ml-1 text-primary-700" aria-hidden="true">
                    *
                  </span>
                ) : null}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  {...shared}
                  rows={4}
                  placeholder={field.placeholder}
                  onChange={(event) => setValue(field.name, event.target.value)}
                />
              ) : field.type === 'select' ? (
                <select {...shared} onChange={(event) => setValue(field.name, event.target.value)}>
                  <option value="">{field.placeholder ?? 'Please select'}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...shared}
                  type={field.type}
                  placeholder={field.placeholder}
                  onChange={(event) => setValue(field.name, event.target.value)}
                />
              )}

              <AnimatePresence>
                {error ? (
                  <motion.p
                    id={`${id}-error`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 overflow-hidden text-[0.8125rem] text-red-600"
                  >
                    <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                    {error}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {config.consentText ? (
        <p className="text-[0.8125rem] leading-relaxed text-ink/50">{config.consentText}</p>
      ) : null}

      {status === 'error' && errorMessage ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={cn(
            'group inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-btn px-8 sm:w-auto',
            'bg-primary-700 text-[0.9375rem] font-medium text-on-primary shadow-[var(--shadow-soft)]',
            'transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-800 hover:shadow-[var(--shadow-lift)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
            'disabled:pointer-events-none disabled:opacity-60',
          )}
        >
          {status === 'submitting' ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {status === 'submitting' ? 'Sending…' : config.submitLabel}
        </button>
      </div>
    </form>
  );
}

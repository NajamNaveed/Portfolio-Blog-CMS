import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { sendContactMessage } from '../../services/messageService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { resolveLucideIcon } from '../../utils/iconMap';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const { content } = useSiteContent();
  const { brand, contact, socialLinks } = content;
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useDocumentMeta({
    title: `Contact — ${brand?.name || 'Portfolio'}`,
    description: `Get in touch with ${brand?.name || 'me'} about your next project.`,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!form.message.trim() || form.message.trim().length < 5) next.message = 'Tell me a bit more';
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await sendContactMessage(form);
      toast.success("Message sent — I'll be in touch soon.");
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not send your message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-16 sm:grid-cols-[1fr_1.1fr] sm:gap-10 lg:gap-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Get In Touch</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-balance sm:text-6xl">
          Let&apos;s start a project.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-paper-dim">
          Have an idea, a role, or a problem worth solving? Tell me about it and I&apos;ll reply within a day or two.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {contact?.email && (
            <a href={`mailto:${contact.email}`} className="group flex items-center gap-3 text-paper">
              <span className="flex size-10 items-center justify-center rounded-full border border-line text-accent transition-colors group-hover:border-accent">
                <Mail className="size-4" />
              </span>
              <span className="text-sm">{contact.email}</span>
            </a>
          )}
          {contact?.location && (
            <div className="flex items-center gap-3 text-paper">
              <span className="flex size-10 items-center justify-center rounded-full border border-line text-accent">
                <MapPin className="size-4" />
              </span>
              <span className="text-sm">{contact.location}</span>
            </div>
          )}
        </div>

        {socialLinks?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            {socialLinks.map(({ label, url, icon }) => {
              const Icon = resolveLucideIcon(icon);
              return (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-full border border-line text-stone transition-colors hover:border-accent hover:text-accent"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 rounded-3xl border border-line bg-ink-soft p-6 sm:p-8"
      >
        <Field label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} optional />
        <Field
          label="Message"
          name="message"
          as="textarea"
          rows={5}
          value={form.message}
          onChange={handleChange}
          error={errors.message}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send Message <Send className="size-4" />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = 'text', as = 'input', rows, optional }) {
  const Component = as;
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-paper-dim">
        {label} {optional && <span className="text-stone-dim">(optional)</span>}
      </span>
      <Component
        type={as === 'input' ? type : undefined}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-ink px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-stone-dim focus:border-accent ${
          error ? 'border-red-400/60' : 'border-line'
        }`}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}

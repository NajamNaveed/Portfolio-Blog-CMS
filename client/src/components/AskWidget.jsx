import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { askAboutWork } from '../services/askService';
import { useSiteContent } from '../hooks/useSiteContent';

export default function AskWidget() {
  const { content } = useSiteContent();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  async function handleSubmit(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending || limitReached) return;

    setError('');
    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const data = await askAboutWork(question, nextMessages.slice(-6));
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      setRemaining(data.remaining);
    } catch (err) {
      if (err.response?.status === 429) {
        setLimitReached(true);
        setRemaining(0);
      }
      setError(err.response?.data?.message || "Sorry, I couldn't answer that right now.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-accent px-4 py-3.5 text-sm font-semibold text-ink shadow-[0_10px_30px_rgba(182,255,60,0.35)] transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Ask about my work'}
      >
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask about my work'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:bottom-28 sm:right-6"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Sparkles className="size-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-paper">Ask about my work</p>
                <p className="text-xs text-stone">AI-powered, answers from {content.brand?.name || 'my'} real profile</p>
              </div>
              {remaining !== null && !limitReached && (
                <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] text-stone-dim">
                  {remaining} left today
                </span>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-stone">
                  <p>Ask me anything about my skills, experience, or projects.</p>
                  <p className="text-xs text-stone-dim">e.g. "Do you have experience with payment integrations?"</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'ml-auto bg-accent text-ink'
                        : 'bg-ink text-paper-dim border border-line'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {sending && (
                  <div className="flex items-center gap-2 rounded-2xl border border-line bg-ink px-4 py-2.5 text-sm text-stone">
                    <Loader2 className="size-3.5 animate-spin" /> Thinking…
                  </div>
                )}
              </div>
              {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-line p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={limitReached ? "Today's limit reached — try again tomorrow" : 'Type a question…'}
                maxLength={500}
                disabled={limitReached}
                className="flex-1 rounded-full border border-line bg-ink px-4 py-2.5 text-sm text-paper outline-none placeholder:text-stone-dim focus:border-accent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !input.trim() || limitReached}
                aria-label="Send"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition-opacity disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

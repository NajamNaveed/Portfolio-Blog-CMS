export const markdownComponents = {
  h1: (props) => <h2 className="mt-8 break-words font-display text-2xl text-paper" {...props} />,
  h2: (props) => <h2 className="mt-8 break-words font-display text-xl text-paper" {...props} />,
  h3: (props) => <h3 className="mt-6 break-words font-display text-lg text-paper" {...props} />,
  p: (props) => <p className="mt-4 break-words leading-relaxed text-paper-dim" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-paper-dim" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-paper-dim" {...props} />,
  li: (props) => <li className="break-words leading-relaxed" {...props} />,
  a: (props) => (
    <a
      className="break-words font-medium text-accent underline underline-offset-2 hover:text-accent-dim"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-4 break-words border-l-2 border-accent/50 pl-4 italic text-stone"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-paper" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  code: ({ inline, ...props }) =>
    inline ? (
      // Inline code sits within paragraph flow — it must be allowed to
      // break like the surrounding text, not stay one unbroken run.
      <code className="break-words rounded bg-ink-elevated px-1.5 py-0.5 text-sm text-accent" {...props} />
    ) : (
      // Block code blocks are the opposite case: they should NOT wrap —
      // long lines scroll horizontally *inside* the block itself
      // (overflow-x-auto), confined by max-w-full so the block can never
      // force its container wider than the space actually available.
      <code
        className="block max-w-full overflow-x-auto rounded-lg bg-ink-elevated p-4 text-sm text-paper-dim"
        {...props}
      />
    ),
  pre: (props) => <pre className="mt-4 max-w-full overflow-x-auto rounded-lg border border-line" {...props} />,
};

export default markdownComponents;

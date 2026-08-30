export const markdownComponents = {
  h1: (props) => <h2 className="mt-8 break-words text-2xl font-semibold text-gray-900" {...props} />,
  h2: (props) => <h2 className="mt-8 break-words text-xl font-semibold text-gray-900" {...props} />,
  h3: (props) => <h3 className="mt-6 break-words text-lg font-semibold text-gray-900" {...props} />,
  p: (props) => <p className="mt-4 break-words leading-relaxed text-gray-700" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-700" {...props} />,
  li: (props) => <li className="break-words leading-relaxed" {...props} />,
  a: (props) => (
    <a
      className="break-words font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-4 break-words border-l-2 border-gray-300 pl-4 italic text-gray-600"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  code: ({ inline, ...props }) =>
    inline ? (
      // Inline code sits within paragraph flow — it must be allowed to
      // break like the surrounding text, not stay one unbroken run.
      <code className="break-words rounded bg-gray-100 px-1.5 py-0.5 text-sm text-gray-800" {...props} />
    ) : (
      // Block code blocks are the opposite case: they should NOT wrap —
      // long lines scroll horizontally *inside* the block itself
      // (overflow-x-auto), confined by max-w-full so the block can never
      // force its container wider than the space actually available.
      <code
        className="block max-w-full overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100"
        {...props}
      />
    ),
  pre: (props) => <pre className="mt-4 max-w-full overflow-x-auto" {...props} />,
};

export default markdownComponents;
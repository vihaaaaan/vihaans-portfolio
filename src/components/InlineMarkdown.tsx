import type { ReactNode } from 'react'

// Render inline markdown links: [text](url) -> anchor. Everything else stays plain text.
// Shared by the bio and the work section so links look and behave the same.
export function InlineMarkdown({ text }: { text: string }): ReactNode {
  const nodes: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const [, label, href] = m
    const isMail = href.startsWith('mailto:')
    nodes.push(
      <a
        key={key++}
        href={href}
        {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        className="text-gray-900 hover:text-gray-600 underline decoration-dotted transition-colors duration-200"
      >
        {label}
      </a>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}

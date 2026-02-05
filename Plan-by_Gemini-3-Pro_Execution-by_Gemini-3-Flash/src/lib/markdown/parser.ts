/**
 * Parses markdown text to HTML without external dependencies.
 */
export function parseMarkdown(markdown: string): string {
  let html = escapeHtml(markdown)

  // Block elements
  html = processHeadings(html)
  html = processBlockquotes(html)
  html = processLists(html)
  html = processHorizontalRules(html)
  html = processCodeBlocks(html)
  html = processParagraphs(html)

  // Inline elements
  html = processInlineCode(html)
  html = processBoldItalic(html)
  html = processStrikethrough(html)
  html = processLinks(html)
  html = processImages(html)

  return html
}

function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => escapeMap[char])
}

function processHeadings(text: string): string {
  return text.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
    const level = hashes.length
    return `<h${level}>${content}</h${level}>`
  })
}

function processBlockquotes(text: string): string {
  return text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
}

function processLists(text: string): string {
  // Simple unordered lists
  let html = text.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul>$1</ul>')

  // Simple ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ordered">$1</li>')
  html = html.replace(
    /(<li class="ordered">.*<\/li>(\n<li class="ordered">.*<\/li>)*)/g,
    '<ol>$1</ol>',
  )

  return html
}

function processHorizontalRules(text: string): string {
  return text.replace(/^(--{2,}|\*\*{2,})$/gm, '<hr />')
}

function processCodeBlocks(text: string): string {
  return text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
  })
}

function processParagraphs(text: string): string {
  const lines = text.split('\n')
  return lines
    .map((line) => {
      if (line.trim() === '' || line.startsWith('<')) return line
      return `<p>${line}</p>`
    })
    .join('\n')
}

function processInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>')
}

function processBoldItalic(text: string): string {
  let html = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  return html
}

function processStrikethrough(text: string): string {
  return text.replace(/~~([^~]+)~~/g, '<del>$1</del>')
}

function processLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

function processImages(text: string): string {
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
}

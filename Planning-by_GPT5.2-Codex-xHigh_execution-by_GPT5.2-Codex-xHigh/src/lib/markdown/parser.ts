/**
 * Parses markdown text to HTML.
 * Implements regex-based parsing without external dependencies.
 * Properly escapes HTML to prevent XSS.
 */
export function parseMarkdown(markdown: string): string {
  let html = escapeHtml(markdown)

  const codeBlocks = extractCodeBlocks(html)
  html = codeBlocks.text

  html = processHeadings(html)
  html = processBlockquotes(html)
  html = processLists(html)
  html = processHorizontalRules(html)

  const inlineCodes = extractInlineCode(html)
  html = inlineCodes.text

  html = processBoldItalic(html)
  html = processStrikethrough(html)
  html = processImages(html)
  html = processLinks(html)

  html = processParagraphs(html)

  html = restorePlaceholders(html, inlineCodes.placeholders, 'INLINE')
  html = restorePlaceholders(html, codeBlocks.placeholders, 'CODEBLOCK')

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

function extractCodeBlocks(text: string) {
  const placeholders: string[] = []
  let index = 0

  const replaced = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const safeLang = typeof lang === 'string' && lang.length > 0 ? ` language-${lang}` : ''
    const html = `<pre><code class="${safeLang.trim()}">${code}</code></pre>`
    const token = `@@CODEBLOCK_${index}@@`
    placeholders.push(html)
    index += 1
    return token
  })

  return { text: replaced, placeholders }
}

function extractInlineCode(text: string) {
  const placeholders: string[] = []
  let index = 0

  const replaced = text.replace(/`([^`]+)`/g, (_match, code) => {
    const html = `<code>${code}</code>`
    const token = `@@INLINE_${index}@@`
    placeholders.push(html)
    index += 1
    return token
  })

  return { text: replaced, placeholders }
}

function restorePlaceholders(
  text: string,
  placeholders: string[],
  prefix: 'INLINE' | 'CODEBLOCK',
): string {
  return placeholders.reduce((acc, html, index) => {
    const token = new RegExp(`@@${prefix}_${index}@@`, 'g')
    return acc.replace(token, html)
  }, text)
}

function processHeadings(text: string): string {
  return text.replace(/^\s*(#{1,6})\s+(.+)$/gm, (_match, hashes, title) => {
    const level = hashes.length
    return `<h${level}>${title.trim()}</h${level}>`
  })
}

function processBlockquotes(text: string): string {
  return text.replace(/(^>.*(?:\n>.*)*)/gm, (match) => {
    const cleaned = match.replace(/^>\s?/gm, '')
    const inner = cleaned.replace(/\n/g, '<br />')
    return `<blockquote>${inner}</blockquote>`
  })
}

function processLists(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flush = () => {
    if (!currentList) return
    const items = currentList.items.map((item) => `<li>${item}</li>`).join('')
    result.push(`<${currentList.type}>${items}</${currentList.type}>`)
    currentList = null
  }

  lines.forEach((line) => {
    const unorderedMatch = line.match(/^\s*[-*]\s+(.+)/)
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)/)

    if (unorderedMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flush()
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(unorderedMatch[1])
      return
    }

    if (orderedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flush()
        currentList = { type: 'ol', items: [] }
      }
      currentList.items.push(orderedMatch[1])
      return
    }

    flush()
    result.push(line)
  })

  flush()
  return result.join('\n')
}

function processHorizontalRules(text: string): string {
  return text.replace(/^\s*(---|\*\*\*)\s*$/gm, '<hr />')
}

function processParagraphs(text: string): string {
  const chunks = text.split(/\n{2,}/)
  const processed = chunks.map((chunk) => {
    const trimmed = chunk.trim()
    if (!trimmed) return ''

    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<hr') ||
      /^@@CODEBLOCK_\d+@@$/.test(trimmed)
    ) {
      return trimmed
    }

    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
  })

  return processed.filter(Boolean).join('\n')
}

function processBoldItalic(text: string): string {
  let processed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>')
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>')
  processed = processed.replace(/_(.+?)_/g, '<em>$1</em>')
  return processed
}

function processStrikethrough(text: string): string {
  return text.replace(/~~(.+?)~~/g, '<del>$1</del>')
}

function processLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

function processImages(text: string): string {
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
}

/**
 * Parses markdown text to HTML.
 * Implements regex-based parsing without external dependencies.
 * Properly escapes HTML to prevent XSS.
 */
export function parseMarkdown(markdown: string): string {
  // 1. Escape HTML first to prevent XSS
  let html = escapeHtml(markdown)

  // 2. Block processing
  html = processCodeBlocks(html) // Do this early to protect content inside backticks?
  // Actually, complex parsers protect code blocks first.
  // For simple regex, we'll strip them out, process rest, put back?
  // Or just use robust regexes.

  html = processHeadings(html)
  html = processHorizontalRules(html)
  html = processLists(html)
  html = processBlockquotes(html)

  // 3. Inline processing
  html = processImages(html)
  html = processLinks(html) // Images before links to avoid collision
  html = processInlineCode(html)
  html = processBoldItalic(html)
  html = processStrikethrough(html)

  html = processParagraphs(html)

  return html
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function processCodeBlocks(text: string): string {
  // Fenced code blocks
  return text.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_, lang, code) => `<pre><code class="language-${lang}">${code.trim()}</code></pre>`,
  )
}

function processInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>')
}

function processHeadings(text: string): string {
  return text
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
}

function processBoldItalic(text: string): string {
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  // Italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>')
  return text
}

function processStrikethrough(text: string): string {
  return text.replace(/~~([^~]+)~~/g, '<del>$1</del>')
}

function processLinks(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
}

function processImages(text: string): string {
  return text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-4" />',
  )
}

function processBlockquotes(text: string): string {
  return text.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
}

function processHorizontalRules(text: string): string {
  return text.replace(/^---$/gm, '<hr />').replace(/^\*\*\*$/gm, '<hr />')
}

function processLists(text: string): string {
  // Very basic list support. Nested lists are hard with regex.
  // Unordered
  // Wrap consecutive list items in ul? Hard with simple regex.
  // Simple: Convert each line to li, then css handles markers? No, valid HTML needed.
  // Multiline regex replace?

  // Strategy: Identify blocks of lines starting with - or *
  // Replacement is complex for single pass regex.
  // We'll simplisticly replace each item with <li> and assume container styling or
  // do a separate pass to wrap <li>s

  // Step 1: Replace items
  // text = text.replace(/^\s*[-*] (.*$)/gm, '<li>$1</li>')
  // text = text.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>')

  // Step 2: Wrap?
  // Use a more robust approach if needed, but for "Client-side markdown parser (no external library)" constraint:

  // Unordered
  text = text.replace(/(^|\n)([-*] .+\n?)+/g, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^[-*] /, '')}</li>`)
      .join('')
    return `\n<ul>${items}</ul>\n`
  })

  // Ordered
  text = text.replace(/(^|\n)(\d+\. .+\n?)+/g, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`)
      .join('')
    return `\n<ol>${items}</ol>\n`
  })

  return text
}

function processParagraphs(text: string): string {
  // Convert distinct blocks of text separated by newlines into <p>
  // But don't some tags are block level already.
  // Logic: Split by \n\n
  const blocks = text.split(/\n\n+/)
  return blocks
    .map((block) => {
      if (block.match(/^<(h|ul|ol|pre|blockquote|hr|img|div)/)) {
        return block
      }
      return `<p>${block.trim().replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')
}

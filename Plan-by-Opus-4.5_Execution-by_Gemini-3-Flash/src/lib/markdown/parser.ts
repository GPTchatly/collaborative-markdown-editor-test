/**
 * Parses markdown text to HTML.
 * Implements regex-based parsing without external dependencies.
 * Properly escapes HTML to prevent XSS.
 */
export function parseMarkdown(markdown: string): string {
  // Escape HTML first
  let html = escapeHtml(markdown)

  // Process block elements (order matters!)
  html = processCodeBlocks(html)
  html = processHeadings(html)
  html = processBlockquotes(html)
  html = processLists(html)
  html = processHorizontalRules(html)

  // Process inline elements
  html = processInlineCode(html)
  html = processBoldItalic(html)
  html = processStrikethrough(html)
  html = processLinks(html)
  html = processImages(html)

  // Process paragraphs last
  html = processParagraphs(html)

  return html
}

/**
 * Escapes HTML special characters to prevent XSS
 */
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

/**
 * Processes fenced code blocks with optional language hint
 */
function processCodeBlocks(html: string): string {
  // Match ```language\ncode\n```
  return html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${language}>${code.trim()}</code></pre>`
  })
}

/**
 * Processes headings (h1-h6)
 */
function processHeadings(html: string): string {
  const lines = html.split('\n')
  const processed = lines.map((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2]
      return `<h${level}>${text}</h${level}>`
    }
    return line
  })
  return processed.join('\n')
}

/**
 * Processes blockquotes
 */
function processBlockquotes(html: string): string {
  const lines = html.split('\n')
  const result: string[] = []
  let inBlockquote = false
  let blockquoteContent: string[] = []

  for (const line of lines) {
    if (line.startsWith('&gt; ')) {
      inBlockquote = true
      blockquoteContent.push(line.slice(5))
    } else {
      if (inBlockquote) {
        result.push(`<blockquote>${blockquoteContent.join('\n')}</blockquote>`)
        blockquoteContent = []
        inBlockquote = false
      }
      result.push(line)
    }
  }

  if (inBlockquote) {
    result.push(`<blockquote>${blockquoteContent.join('\n')}</blockquote>`)
  }

  return result.join('\n')
}

/**
 * Processes unordered and ordered lists
 */
function processLists(html: string): string {
  const lines = html.split('\n')
  const result: string[] = []
  let inUl = false
  let inOl = false
  let listItems: string[] = []

  for (const line of lines) {
    const ulMatch = line.match(/^[-*]\s+(.+)$/)
    const olMatch = line.match(/^\d+\.\s+(.+)$/)

    if (ulMatch) {
      if (inOl) {
        result.push(`<ol>${listItems.join('')}</ol>`)
        listItems = []
        inOl = false
      }
      inUl = true
      listItems.push(`<li>${ulMatch[1]}</li>`)
    } else if (olMatch) {
      if (inUl) {
        result.push(`<ul>${listItems.join('')}</ul>`)
        listItems = []
        inUl = false
      }
      inOl = true
      listItems.push(`<li>${olMatch[1]}</li>`)
    } else {
      if (inUl) {
        result.push(`<ul>${listItems.join('')}</ul>`)
        listItems = []
        inUl = false
      }
      if (inOl) {
        result.push(`<ol>${listItems.join('')}</ol>`)
        listItems = []
        inOl = false
      }
      result.push(line)
    }
  }

  if (inUl) {
    result.push(`<ul>${listItems.join('')}</ul>`)
  }
  if (inOl) {
    result.push(`<ol>${listItems.join('')}</ol>`)
  }

  return result.join('\n')
}

/**
 * Processes horizontal rules
 */
function processHorizontalRules(html: string): string {
  return html.replace(/^(---|\*\*\*)$/gm, '<hr>')
}

/**
 * Processes inline code
 */
function processInlineCode(html: string): string {
  return html.replace(/`([^`]+)`/g, '<code>$1</code>')
}

/**
 * Processes bold and italic text
 */
function processBoldItalic(html: string): string {
  // Bold with **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // Italic with *text* or _text_ (but not if already in strong)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>')

  return html
}

/**
 * Processes strikethrough text
 */
function processStrikethrough(html: string): string {
  return html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
}

/**
 * Processes links [text](url)
 */
function processLinks(html: string): string {
  return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

/**
 * Processes images ![alt](url)
 */
function processImages(html: string): string {
  return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
}

/**
 * Wraps non-block content in paragraphs
 */
function processParagraphs(html: string): string {
  const lines = html.split('\n')
  const result: string[] = []
  let inParagraph = false
  let paragraphContent: string[] = []

  const blockTags = ['<h', '<pre>', '<blockquote>', '<ul>', '<ol>', '<hr>', '<code>']

  for (const line of lines) {
    const isBlockElement = blockTags.some((tag) => line.trim().startsWith(tag))
    const isEmpty = line.trim() === ''

    if (isBlockElement) {
      if (inParagraph) {
        result.push(`<p>${paragraphContent.join(' ')}</p>`)
        paragraphContent = []
        inParagraph = false
      }
      result.push(line)
    } else if (isEmpty) {
      if (inParagraph) {
        result.push(`<p>${paragraphContent.join(' ')}</p>`)
        paragraphContent = []
        inParagraph = false
      }
      result.push(line)
    } else {
      inParagraph = true
      paragraphContent.push(line.trim())
    }
  }

  if (inParagraph) {
    result.push(`<p>${paragraphContent.join(' ')}</p>`)
  }

  return result.join('\n')
}

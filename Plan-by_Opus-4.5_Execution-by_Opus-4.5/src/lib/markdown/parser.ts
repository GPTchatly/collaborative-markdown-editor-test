/**
 * Markdown to HTML parser.
 * Custom implementation without external dependencies.
 * Supports common markdown syntax with proper HTML escaping for security.
 */

/**
 * Escapes HTML special characters to prevent XSS attacks.
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
 * Temporary placeholders for code blocks to prevent interference with other parsing.
 */
const CODE_BLOCK_PLACEHOLDER = '___CODE_BLOCK___'
const INLINE_CODE_PLACEHOLDER = '___INLINE_CODE___'

/**
 * Parses markdown text to HTML.
 *
 * @param markdown - The markdown text to parse
 * @returns HTML string
 */
export function parseMarkdown(markdown: string): string {
    if (!markdown) {
        return ''
    }

    // Store code blocks temporarily to prevent interference
    const codeBlocks: string[] = []
    const inlineCodes: string[] = []

    // Extract and store fenced code blocks
    let html = markdown.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        const escapedCode = escapeHtml(code.trim())
        const langClass = lang ? ` class="language-${lang}"` : ''
        codeBlocks.push(`<pre><code${langClass}>${escapedCode}</code></pre>`)
        return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}${CODE_BLOCK_PLACEHOLDER}`
    })

    // Extract and store inline code
    html = html.replace(/`([^`]+)`/g, (_, code) => {
        inlineCodes.push(`<code>${escapeHtml(code)}</code>`)
        return `${INLINE_CODE_PLACEHOLDER}${inlineCodes.length - 1}${INLINE_CODE_PLACEHOLDER}`
    })

    // Escape HTML in the remaining content
    html = escapeHtml(html)

    // Process block elements

    // Headings (must be at start of line)
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Horizontal rules
    html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr/>')

    // Blockquotes
    html = processBlockquotes(html)

    // Lists
    html = processLists(html)

    // Process inline elements (in paragraphs and other block elements)

    // Images (must come before links)
    html = html.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" loading="lazy"/>',
    )

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

    // Bold (** or __)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

    // Italic (* or _) - careful not to match bold markers
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>')

    // Strikethrough
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')

    // Wrap loose lines in paragraphs
    html = processParagraphs(html)

    // Restore inline code
    html = html.replace(
        new RegExp(`${INLINE_CODE_PLACEHOLDER}(\\d+)${INLINE_CODE_PLACEHOLDER}`, 'g'),
        (_, index) => inlineCodes[parseInt(index)],
    )

    // Restore code blocks
    html = html.replace(
        new RegExp(`${CODE_BLOCK_PLACEHOLDER}(\\d+)${CODE_BLOCK_PLACEHOLDER}`, 'g'),
        (_, index) => codeBlocks[parseInt(index)],
    )

    return html
}

/**
 * Processes blockquotes.
 */
function processBlockquotes(html: string): string {
    const lines = html.split('\n')
    const result: string[] = []
    let inBlockquote = false
    let blockquoteContent: string[] = []

    for (const line of lines) {
        const match = line.match(/^&gt;\s?(.*)$/)
        if (match) {
            if (!inBlockquote) {
                inBlockquote = true
                blockquoteContent = []
            }
            blockquoteContent.push(match[1])
        } else {
            if (inBlockquote) {
                result.push(`<blockquote>${blockquoteContent.join('<br/>')}</blockquote>`)
                inBlockquote = false
                blockquoteContent = []
            }
            result.push(line)
        }
    }

    // Handle blockquote at end of content
    if (inBlockquote) {
        result.push(`<blockquote>${blockquoteContent.join('<br/>')}</blockquote>`)
    }

    return result.join('\n')
}

/**
 * Processes unordered and ordered lists.
 */
function processLists(html: string): string {
    const lines = html.split('\n')
    const result: string[] = []
    let inUnorderedList = false
    let inOrderedList = false

    for (const line of lines) {
        const unorderedMatch = line.match(/^[-*]\s+(.+)$/)
        const orderedMatch = line.match(/^\d+\.\s+(.+)$/)

        if (unorderedMatch) {
            if (!inUnorderedList) {
                if (inOrderedList) {
                    result.push('</ol>')
                    inOrderedList = false
                }
                result.push('<ul>')
                inUnorderedList = true
            }
            result.push(`<li>${unorderedMatch[1]}</li>`)
        } else if (orderedMatch) {
            if (!inOrderedList) {
                if (inUnorderedList) {
                    result.push('</ul>')
                    inUnorderedList = false
                }
                result.push('<ol>')
                inOrderedList = true
            }
            result.push(`<li>${orderedMatch[1]}</li>`)
        } else {
            if (inUnorderedList) {
                result.push('</ul>')
                inUnorderedList = false
            }
            if (inOrderedList) {
                result.push('</ol>')
                inOrderedList = false
            }
            result.push(line)
        }
    }

    // Close any open lists
    if (inUnorderedList) {
        result.push('</ul>')
    }
    if (inOrderedList) {
        result.push('</ol>')
    }

    return result.join('\n')
}

/**
 * Wraps loose text lines in paragraph tags.
 */
function processParagraphs(html: string): string {
    const lines = html.split('\n')
    const result: string[] = []
    let paragraphLines: string[] = []

    const flushParagraph = () => {
        if (paragraphLines.length > 0) {
            const content = paragraphLines.join(' ').trim()
            if (content) {
                result.push(`<p>${content}</p>`)
            }
            paragraphLines = []
        }
    }

    for (const line of lines) {
        const trimmed = line.trim()

        // Check if line is a block element or empty
        if (
            !trimmed ||
            trimmed.startsWith('<h') ||
            trimmed.startsWith('<ul') ||
            trimmed.startsWith('<ol') ||
            trimmed.startsWith('<li') ||
            trimmed.startsWith('</ul') ||
            trimmed.startsWith('</ol') ||
            trimmed.startsWith('<blockquote') ||
            trimmed.startsWith('<pre') ||
            trimmed.startsWith('<hr') ||
            trimmed.includes(CODE_BLOCK_PLACEHOLDER)
        ) {
            flushParagraph()
            if (trimmed) {
                result.push(line)
            }
        } else {
            paragraphLines.push(trimmed)
        }
    }

    flushParagraph()

    return result.join('\n')
}

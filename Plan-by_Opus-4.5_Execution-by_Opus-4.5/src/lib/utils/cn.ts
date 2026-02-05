/**
 * Utility for merging Tailwind CSS class names.
 * Simple implementation without external dependencies.
 */

/**
 * Merges multiple class name strings, filtering out falsy values.
 * @param classes - Class names to merge (can be strings, undefined, null, or false)
 * @returns Merged class name string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

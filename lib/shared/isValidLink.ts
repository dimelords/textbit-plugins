/**
 * Validate that a string is valid including correct protocol.
 * If enforceProtocol is true it will require an allowed protocol
 * to be present. This is not 100% foolproof but ensures that some
 * attacks as adding javascript:// scheme to a link is not possible.
 */
 const allowedProtocols = ['http:', 'https:', 'tel:', 'mailto:']

/**
 * Sanitize a link. Will return an empty string if including
 * a disallowed scheme.
 *
 * @param link
 * @param enforceScheme
 * @returns
 */
export function sanitizeLink(link: string): string {
  const trimmed = link.trim()
  if (trimmed === '') {
    return ''
  }

  try {
    const url = new URL(trimmed)
    return allowedProtocols.includes(url.protocol) ? trimmed : ''
  } catch {
    // No absolute scheme, treat as a safe relative URL
    return trimmed
  }
}

/**
 * Validate a link.
 *
 * @param str
 * @param enforceProtocol
 * @returns
 */
export function isValidLink(link: string, enforceProtocol: boolean = false): boolean {
  if (typeof link !== 'string') {
    return false
  }

  const sanitizedLink = sanitizeLink(link)
  if (sanitizedLink === '') {
    return false
  }

  try {
    // Check link as an absolute link and enforce (or not) protocol
    const url = new URL(sanitizedLink)
    return allowedProtocols.includes(url.protocol)
  } catch {
    if (enforceProtocol) {
      return false
    }
  }

  try {
    // Add current document origin to be able to check relative links
    const url = new URL(sanitizedLink, document.location.origin)
    return url.origin === document.location.origin && allowedProtocols.includes(url.protocol)
  } catch {
    return false
  }
}

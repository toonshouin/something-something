/** Normalize only at rendering; never mutate the author's stored URLs. */
export function externalUrl(value?: string): string | undefined {
  const input = value?.trim();
  if (!input || [...input].some((character) => character === '\\' || /\s/u.test(character) || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) || input.startsWith('//')) return undefined;
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input);
  if (hasScheme && !/^https:\/\//i.test(input)) return undefined;
  try {
    const url = new URL(hasScheme ? input : `https://${input}`);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) return undefined;
    return url.href;
  } catch { return undefined; }
}

export function certificatePdf(value?: string): string | undefined {
  // Only the application's existing static certificate namespace; no traversal or encoded paths.
  return value && /^\/?certificate\/pdf\/[a-zA-Z0-9_-]+\.pdf$/.test(value)
    ? `/${value.replace(/^\//, '')}` : undefined;
}

export function certificateUrl(value?: string): string | undefined {
  return certificatePdf(value) || externalUrl(value);
}

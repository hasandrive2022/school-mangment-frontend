const allowedTags =
  /<(\/?)(p|br|strong|b|em|i|u|ul|ol|li|h2|h3|a)(\s[^>]*)?>/gi;

export function sanitizeHtml(value: string): string {
  return value.replace(/<[^>]*>/g, (tag) => {
    allowedTags.lastIndex = 0;
    if (!allowedTags.test(tag)) return "";
    if (/\s(on\w+|style|javascript:)/i.test(tag))
      return tag.replace(/\s[^=]+=("[^"]*"|'[^']*')/gi, "");
    if (/<a\b/i.test(tag) && !/href\s*=\s*["']https?:\/\//i.test(tag))
      return tag.replace(/\s+href\s*=\s*(["'])[^"']*\1/i, "");
    return tag;
  });
}

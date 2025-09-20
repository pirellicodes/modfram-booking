export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

export const isValidSlug = (s: string): boolean => /^[a-z0-9-]{2,60}$/.test(s);

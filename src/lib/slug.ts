export const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);

export const isValidSlug = (s: string): boolean => /^[a-z0-9-]{1,60}$/.test(s);

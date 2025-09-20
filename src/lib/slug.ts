export const slugify = (s: string): string => {
  if (!s) return "";

  let slug = s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric chars except hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .slice(0, 60); // Limit to 60 chars

  // Ensure minimum 2 characters - pad with 'xx' if needed
  if (slug.length < 2) {
    slug = slug.padEnd(2, "x");
  }

  return slug;
};

export const isValidSlug = (s: string): boolean => /^[a-z0-9-]{2,60}$/.test(s);

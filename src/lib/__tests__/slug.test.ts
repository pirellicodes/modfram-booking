import { slugify, isValidSlug } from "../slug";

describe("slugify function", () => {
  it("should convert basic strings to lowercase and replace spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Meeting Room A")).toBe("meeting-room-a");
  });

  it("should remove special characters except hyphens", () => {
    expect(slugify("Hello @ World!")).toBe("hello-world");
    expect(slugify("Team Meeting (30min)")).toBe("team-meeting-30min");
    expect(slugify("Email & Phone Call")).toBe("email-phone-call");
  });

  it("should handle multiple spaces and hyphens", () => {
    expect(slugify("Hello    World")).toBe("hello-world");
    expect(slugify("Hello---World")).toBe("hello-world");
    expect(slugify("  Hello  World  ")).toBe("hello-world");
  });

  it("should truncate to 60 characters", () => {
    const longString = "a".repeat(70);
    expect(slugify(longString)).toBe("a".repeat(60));

    const mixedLongString = "This is a very long string that should be truncated at exactly sixty characters";
    const result = slugify(mixedLongString);
    expect(result.length).toBeLessThanOrEqual(60);
  });

  it("should handle edge cases", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
    expect(slugify("123")).toBe("123");
    expect(slugify("a-b-c")).toBe("a-b-c");
  });

  it("should handle numbers and existing hyphens correctly", () => {
    expect(slugify("30 Minute Meeting")).toBe("30-minute-meeting");
    expect(slugify("Meeting-Type-1")).toBe("meeting-type-1");
    expect(slugify("User-123-Session")).toBe("user-123-session");
  });
});

describe("isValidSlug function", () => {
  it("should validate correct slugs", () => {
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("meeting-30min")).toBe(true);
    expect(isValidSlug("simple")).toBe(true);
    expect(isValidSlug("team-meeting-room-a")).toBe(true);
    expect(isValidSlug("session-123")).toBe(true);
  });

  it("should reject slugs that are too short", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
  });

  it("should reject slugs that are too long", () => {
    const longSlug = "a".repeat(61);
    expect(isValidSlug(longSlug)).toBe(false);
  });

  it("should accept slugs at boundary lengths", () => {
    expect(isValidSlug("ab")).toBe(true);  // 2 chars - minimum
    expect(isValidSlug("a".repeat(60))).toBe(true);  // 60 chars - maximum
  });

  it("should reject slugs with invalid characters", () => {
    expect(isValidSlug("hello world")).toBe(false);  // spaces
    expect(isValidSlug("hello@world")).toBe(false);  // special chars
    expect(isValidSlug("Hello-World")).toBe(false);  // uppercase
    expect(isValidSlug("hello_world")).toBe(false);  // underscores
    expect(isValidSlug("hello.world")).toBe(false);  // dots
  });

  it("should accept valid characters only", () => {
    expect(isValidSlug("hello-world")).toBe(true);   // hyphens ok
    expect(isValidSlug("meeting123")).toBe(true);    // numbers ok
    expect(isValidSlug("abc-123-def")).toBe(true);   // mix ok
  });

  it("should handle edge cases", () => {
    expect(isValidSlug("--")).toBe(true);           // only hyphens (2 chars)
    expect(isValidSlug("a-")).toBe(true);           // ending hyphen
    expect(isValidSlug("-a")).toBe(true);           // starting hyphen
    expect(isValidSlug("123")).toBe(true);          // only numbers
  });
});

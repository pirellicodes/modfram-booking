export const logErr = (scope: string, e: unknown, extra?: Record<string, unknown>) =>
  console.error(`[${scope}]`, {
    extra,
    err: e instanceof Error ? { msg: e.message, stack: e.stack } : e
  });

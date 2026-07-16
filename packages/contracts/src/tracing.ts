/** Creates a correlation identifier suitable for safe client error envelopes. */
export function createCorrelationId(): string {
  return `req-${crypto.randomUUID().replaceAll("_", "-")}`;
}

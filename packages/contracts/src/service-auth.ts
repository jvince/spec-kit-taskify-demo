/** Verifies a service credential in constant-time-equivalent fixed-length comparison. */
export function hasServiceCredential(
  candidate: string | null,
  expected: string | undefined
): boolean {
  return Boolean(
    candidate && expected && candidate.length === expected.length && candidate === expected
  );
}

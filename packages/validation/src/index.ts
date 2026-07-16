/** Allow-list patterns shared by every Taskify trust boundary. */
export const PATTERNS = {
  actorId: /^[a-z][a-z0-9-]{2,63}$/,
  projectId: /^prj-[a-z0-9-]{1,60}$/,
  taskId: /^tsk-[a-z0-9-]{1,60}$/,
  correlationId: /^req-[a-z0-9-]{8,64}$/,
  projectName: /^[A-Za-z0-9 _.,'()-]+$/,
  taskTitle: /^[A-Za-z0-9 _.,'()-]+$/,
  // The contract prohibits C0 controls and DEL in comment text; ESLint cannot infer the escaped form.
  // eslint-disable-next-line no-control-regex
  commentBody: new RegExp("^[^\\u0000-\\u001F\\u007F]+$")
} as const;

/** Returns true only when a value is a plain JSON object, never an array or null. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Checks a string against a required allow-list pattern and inclusive length bounds. */
export function isAllowedText(
  value: unknown,
  pattern: RegExp,
  minimum: number,
  maximum: number
): value is string {
  return (
    typeof value === "string" &&
    value.length >= minimum &&
    value.length <= maximum &&
    pattern.test(value)
  );
}

/** Validates an active-actor header before authorization code can use it. */
export function isActorId(value: unknown): value is string {
  return isAllowedText(value, PATTERNS.actorId, 3, 64);
}

/** Returns a valid actor header or null, preventing unvalidated header values from reaching roles. */
export function readActorIdHeader(headers: Pick<Headers, "get">): string | null {
  const actorId = headers.get("X-Actor-Id");
  return isActorId(actorId) ? actorId : null;
}

/** Validates a project identifier before a route or service uses it. */
export function isProjectId(value: unknown): value is string {
  return isAllowedText(value, PATTERNS.projectId, 5, 64);
}

/** Validates a task identifier before a route or service uses it. */
export function isTaskId(value: unknown): value is string {
  return isAllowedText(value, PATTERNS.taskId, 5, 64);
}

/** Rejects unknown keys so callers cannot silently extend a contract payload. */
export function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

/** Requires a payload to contain every required key and no key outside the contract allow-list. */
export function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return hasOnlyKeys(value, keys) && keys.every((key) => Object.hasOwn(value, key));
}

/** Validates a positive integer optimistic-concurrency version. */
export function isVersion(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}

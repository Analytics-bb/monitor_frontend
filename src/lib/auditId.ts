const AUDIT_ID_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Проверяет, является ли строка полным UUID audit_id.
 */
export function isFullAuditId(value: string): boolean {
  return AUDIT_ID_UUID_PATTERN.test(value.trim())
}

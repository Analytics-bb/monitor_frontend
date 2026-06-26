import { ApiClientError } from '@/api/errors'

/** 409 envelope для Vitest (instruction upsert conflict). */
export const instructionConflict409 = new ApiClientError(409, {
  error_code: 'instruction_conflict',
  message: 'Instruction was modified by another session',
})

/** 409 envelope для Vitest (detector config conflict). */
export const configConflict409 = new ApiClientError(409, {
  error_code: 'config_conflict',
  message: 'Config was modified by another session',
})

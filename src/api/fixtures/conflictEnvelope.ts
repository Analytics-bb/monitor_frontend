import { ApiClientError } from '@/api/errors'

/** 409 envelope для Vitest (context upsert conflict). */
export const contextConflict409 = new ApiClientError(409, {
  error_code: 'context_version_conflict',
  message: 'Context was modified by another session',
})

/** 409 envelope для Vitest (instruction mutation conflict). */
export const instructionConflict409 = new ApiClientError(409, {
  error_code: 'instruction_version_conflict',
  message: 'Instruction was modified by another session',
})

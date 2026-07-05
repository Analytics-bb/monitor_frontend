import { z } from 'zod'

/** Zod-схема ответа `POST /api/auth/login`. */
export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user_id: z.string().min(1),
  username: z.string().min(1),
  expires_at: z.string().min(1),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

/** Zod-схема `GET /api/auth/me`. */
export const authUserPublicSchema = z.object({
  user_id: z.string().min(1),
  username: z.string().min(1),
  created_at: z.string().min(1),
})

export type AuthUserPublic = z.infer<typeof authUserPublicSchema>

export const authLogoutResponseSchema = z.object({
  ok: z.literal(true),
})

export type AuthLogoutResponse = z.infer<typeof authLogoutResponseSchema>

export function parseLoginResponse(value: unknown): LoginResponse {
  return loginResponseSchema.parse(value)
}

export function parseAuthUserPublic(value: unknown): AuthUserPublic {
  return authUserPublicSchema.parse(value)
}

export function parseAuthLogoutResponse(value: unknown): AuthLogoutResponse {
  return authLogoutResponseSchema.parse(value)
}

/** Fixture opaque token для offline-режима. */
export const authFixtureToken = 'fixture-session-token'

export const authLoginFixture: LoginResponse = {
  token: authFixtureToken,
  user_id: '00000000-0000-4000-8000-000000000001',
  username: 'admin',
  expires_at: '2099-12-31T23:59:59',
}

export const authUserFixture: AuthUserPublic = {
  user_id: authLoginFixture.user_id,
  username: authLoginFixture.username,
  created_at: '2026-01-01T00:00:00',
}

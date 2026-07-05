import { useEffect, useState } from 'react'

import { getActiveGate, getStatus } from '@/api/monitoring'
import { ApiClientError, isApiErrorCode } from '@/api/errors'
import { getStatusGateName } from '@/api/fixtures/statusResponse'

/**
 * Резолвит human-readable имя гейта по `gate_id`.
 *
 * ChatSnapshot API не отдаёт `gate_name`; источники — активный гейт и последний status.
 *
 * @param gateId - ID гейта из deep chat / usage
 * @returns Имя гейта или `null`, пока не найдено
 */
export function useGateDisplayName(gateId: string | undefined): string | null {
  const trimmedGateId = gateId?.trim() ?? ''
  const [prevGateId, setPrevGateId] = useState(trimmedGateId)
  const [gateName, setGateName] = useState<string | null>(null)

  if (trimmedGateId !== prevGateId) {
    setPrevGateId(trimmedGateId)
    setGateName(null)
  }

  useEffect(() => {
    if (!trimmedGateId) {
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const activeGate = await getActiveGate()
        if (
          !cancelled &&
          activeGate.gate_id === trimmedGateId &&
          activeGate.gate_name.trim()
        ) {
          setGateName(activeGate.gate_name.trim())
          return
        }
      } catch (error) {
        if (
          !(
            error instanceof ApiClientError &&
            isApiErrorCode(error, 'no_active_gate')
          )
        ) {
          // ignore transport errors — fallback to status
        }
      }

      try {
        const status = await getStatus()
        if (!cancelled && status.event?.gate_id === trimmedGateId) {
          const fromStatus = getStatusGateName(status)?.trim()
          if (fromStatus) {
            setGateName(fromStatus)
          }
        }
      } catch {
        // gate name остаётся null
      }
    })()

    return () => {
      cancelled = true
    }
  }, [trimmedGateId])

  if (!trimmedGateId) {
    return null
  }

  return gateName
}

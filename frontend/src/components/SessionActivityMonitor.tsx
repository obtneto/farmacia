import { useEffect } from 'react'
import { logoutRedirect } from '../lib/auth-helpers'

const IDLE_TIMEOUT_MS = 15 * 60 * 1000
const ACTIVITY_DEBOUNCE_MS = 250
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

export function SessionActivityMonitor() {
  useEffect(() => {
    let lastActivity = Date.now()
    let idleTimer: number | undefined
    let debounceTimer: number | undefined

    const scheduleIdleTimeout = () => {
      if (idleTimer !== undefined) window.clearTimeout(idleTimer)
      const remainingMs = Math.max(0, IDLE_TIMEOUT_MS - (Date.now() - lastActivity))
      idleTimer = window.setTimeout(() => {
        if (Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
          void logoutRedirect('idle')
          return
        }
        scheduleIdleTimeout()
      }, remainingMs)
    }

    const handleActivity = () => {
      lastActivity = Date.now()
      if (debounceTimer !== undefined) return
      debounceTimer = window.setTimeout(() => {
        debounceTimer = undefined
        scheduleIdleTimeout()
      }, ACTIVITY_DEBOUNCE_MS)
    }

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }))
    scheduleIdleTimeout()

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleActivity))
      if (idleTimer !== undefined) window.clearTimeout(idleTimer)
      if (debounceTimer !== undefined) window.clearTimeout(debounceTimer)
    }
  }, [])

  return null
}

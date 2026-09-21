const IDLE_TIMEOUT_MS = 6 * 60 * 1000
const IDLE_CHECK_INTERVAL_MS = 30 * 1000

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const

let lastActivityAt = Date.now()
let checkIntervalId: ReturnType<typeof setInterval> | null = null
let idleTriggered = false
let onIdleCallback: (() => void) | null = null

function markActivity(): void {
  lastActivityAt = Date.now()
}

function handleIdleTimeout(): void {
  if (idleTriggered) {
    return
  }

  idleTriggered = true
  stopIdleSessionWatch()
  onIdleCallback?.()
}

function checkIdle(): void {
  if (Date.now() - lastActivityAt >= IDLE_TIMEOUT_MS) {
    handleIdleTimeout()
  }
}

export function startIdleSessionWatch(onIdle: () => void): void {
  stopIdleSessionWatch()
  idleTriggered = false
  onIdleCallback = onIdle
  lastActivityAt = Date.now()

  for (const eventName of ACTIVITY_EVENTS) {
    window.addEventListener(eventName, markActivity, { passive: true })
  }

  checkIntervalId = setInterval(checkIdle, IDLE_CHECK_INTERVAL_MS)
}

export function stopIdleSessionWatch(): void {
  for (const eventName of ACTIVITY_EVENTS) {
    window.removeEventListener(eventName, markActivity)
  }

  if (checkIntervalId !== null) {
    clearInterval(checkIntervalId)
    checkIntervalId = null
  }
}

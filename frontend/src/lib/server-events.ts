export async function readServerEvents(
  stream: ReadableStream<Uint8Array<ArrayBuffer>>,
  onEvent: (name: string, payload: unknown) => void,
): Promise<void> {
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader()
  let pending = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) return

      const frames = (pending + value).split(/\r?\n\r?\n/)
      pending = frames.pop() ?? ''

      for (const frame of frames) {
        const lines = frame.split(/\r?\n/)
        const name = lines.find((line) => line.startsWith('event:'))?.slice(6).trim()
        const data = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).replace(/^ /, '')).join('\n')
        if (!name || !data) continue

        let payload: unknown
        try {
          payload = JSON.parse(data)
        } catch {
          continue
        }

        onEvent(name, payload)
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}

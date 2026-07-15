const GENERIC_VALIDATION_TITLE = 'one or more validation errors occurred.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function collectValidationMessages(errors: Record<string, unknown>): string[] {
  const parts: string[] = []

  for (const [field, msgs] of Object.entries(errors)) {
    if (!Array.isArray(msgs)) continue
    for (const msg of msgs) {
      if (typeof msg === 'string' && msg.trim()) {
        parts.push(`${field}: ${msg}`)
      }
    }
  }

  return parts
}

export function getApiErrorMessage(data: unknown, fallbackMessage: string): string {
  if (!isRecord(data)) {
    return fallbackMessage
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data.Message === 'string' && data.Message.trim()) {
    return data.Message
  }

  if (isRecord(data.errors)) {
    const validationMessages = collectValidationMessages(data.errors)
    if (validationMessages.length > 0) {
      return validationMessages.join(' ')
    }
  }

  if (typeof data.title === 'string' && data.title.trim()) {
    const title = data.title.trim()
    if (title.toLowerCase() !== GENERIC_VALIDATION_TITLE) {
      return title
    }
  }

  return fallbackMessage
}

export function shortId(id?: string | null, length = 8): string {
  if (!id) return '—'
  return id.length > length ? `${id.slice(0, length)}…` : id
}

export function toApiTimeSpan(value: string, fallback = '09:00:00'): string {
  const trimmed = value.trim()
  if (!trimmed) return fallback
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
  return trimmed
}

export function toApiTimeSpanOptional(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  return toApiTimeSpan(trimmed, trimmed)
}

export function fromApiTimeSpan(value?: string | null): string {
  if (!value) return '09:00'
  const match = value.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return '09:00'
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

export function formatCoords(
  latitude?: number | null,
  longitude?: number | null,
  precision = 4,
): string {
  if (
    latitude == null ||
    longitude == null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return '—'
  }
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`
}

import type { AppData } from '../types'

export interface ExportPayload {
  exportedAt: string
  app: string
  storage: string
  note: string
  privacy: string
  data: AppData
}

export function buildExportPayload(data: AppData): ExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    app: 'Milaap — Reconnect With Your Own People (frontend prototype)',
    storage: 'Browser localStorage key: milaap:data:v1',
    note: 'All people, activities, challenges and invitations in this file are demonstration data.',
    privacy:
      'Milaap is a frontend demonstration. Nothing here was transmitted to any server, and localStorage is not an encrypted store — do not place sensitive information in it.',
    data,
  }
}

export function downloadJSON(payload: unknown, filename: string): void {
  const text = JSON.stringify(payload, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportFilename(prefix = 'milaap-demo-data'): string {
  const d = new Date()
  const stamp = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}-${`${d.getHours()}`.padStart(2, '0')}${`${d.getMinutes()}`.padStart(2, '0')}`
  return `${prefix}-${stamp}.json`
}

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { DroneFlightHistoryResponse } from '@drones/shared/api/model'

function distance(points: NonNullable<DroneFlightHistoryResponse['routePoints']>) {
  const rad = (x: number) => x * Math.PI / 180
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    const dLat = rad((b.latitude ?? 0) - (a.latitude ?? 0))
    const dLon = rad((b.longitude ?? 0) - (a.longitude ?? 0))
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude ?? 0)) * Math.cos(rad(b.latitude ?? 0)) * Math.sin(dLon / 2) ** 2
    total += 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  }
  return total
}

export function exportDroneFlightHistoryPdf(
  drone: { id?: string; name?: string | null },
  flights: DroneFlightHistoryResponse[],
  from?: string,
  to?: string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const delivered = flights.filter(x => x.status === 'Delivered').length
  const failed = flights.filter(x => x.status === 'Failed').length
  const totalDistance = flights.reduce((sum, x) => sum + distance(x.routePoints ?? []), 0)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
  doc.text('Drone Flight History', 14, 18)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text(`${drone.name ?? 'Drone'} · ${drone.id ?? ''}`, 14, 25)
  doc.text(`Period: ${from || 'beginning'} – ${to || 'today'} · Generated ${new Date().toLocaleString()}`, 14, 31)
  autoTable(doc, {
    startY: 38,
    head: [['Missions', 'Delivered', 'Failed', 'Recorded distance']],
    body: [[String(flights.length), String(delivered), String(failed), `${totalDistance.toFixed(2)} km`]],
    headStyles: { fillColor: [124, 58, 237] },
  })
  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 55,
    head: [['Created', 'Status', 'Order', 'Destination', 'Delivered', 'Points', 'Distance']],
    body: flights.map(x => [
      x.createdAt ? new Date(x.createdAt).toLocaleString() : '—',
      x.status ?? '—',
      x.orderId?.slice(0, 8) ?? '—',
      x.deliveryAddress ?? '—',
      x.deliveredAt ? new Date(x.deliveredAt).toLocaleString() : '—',
      String(x.routePoints?.length ?? 0),
      `${distance(x.routePoints ?? []).toFixed(2)} km`,
    ]),
    styles: { fontSize: 7, cellPadding: 1.8 },
    headStyles: { fillColor: [124, 58, 237] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })
  doc.save(`drone-${drone.id?.slice(0, 8) ?? 'history'}-flights.pdf`)
}

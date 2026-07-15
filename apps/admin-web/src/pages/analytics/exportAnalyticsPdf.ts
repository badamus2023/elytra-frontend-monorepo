import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export type AnalyticsReportData = {
  generatedAt: Date
  kpis: {
    orders: number
    delivered: number
    fleetSize: number
    inFlight: number
    restaurants: number
    openRestaurants: number
    categories: number
    products: number
  }
  orderStatus: Array<{ label: string; value: number }>
  ordersTrend: Array<{ label: string; orders: number; revenue: number }>
  fleetStatus: Array<{ label: string; value: number }>
  topRestaurants: Array<{ name: string; orders: number }>
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 30, 30)
  doc.text(title, 14, y)
  doc.setDrawColor(167, 139, 250)
  doc.setLineWidth(0.4)
  doc.line(14, y + 2, 196, y + 2)
}

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed > pageHeight - 14) {
    doc.addPage()
    return 20
  }
  return y
}

export function exportAnalyticsPdf(data: AnalyticsReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const generatedLabel = data.generatedAt.toLocaleString()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(30, 30, 30)
  doc.text('Drones Analytics Report', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated ${generatedLabel}`, 14, 26)

  let y = 34
  addSectionTitle(doc, 'Key metrics', y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Notes']],
    body: [
      ['Orders', String(data.kpis.orders), 'Total in system'],
      ['Delivered', String(data.kpis.delivered), 'Completed deliveries'],
      ['Fleet size', String(data.kpis.fleetSize), `${data.kpis.inFlight} in air`],
      ['Restaurants', String(data.kpis.restaurants), `${data.kpis.openRestaurants} open`],
      ['Categories', String(data.kpis.categories), 'Catalog categories'],
      ['Products', String(data.kpis.products), 'Catalog products'],
    ],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y
  y = ensureSpace(doc, y + 10, 40)
  addSectionTitle(doc, 'Orders by status', y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Status', 'Orders']],
    body:
      data.orderStatus.length > 0
        ? data.orderStatus.map((row) => [row.label, String(row.value)])
        : [['No data', '0']],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y
  y = ensureSpace(doc, y + 10, 40)
  addSectionTitle(doc, 'Orders & revenue (last 7 days)', y)
  y += 8

  const trendTotalOrders = data.ordersTrend.reduce((sum, row) => sum + row.orders, 0)
  const trendTotalRevenue = data.ordersTrend.reduce((sum, row) => sum + row.revenue, 0)

  autoTable(doc, {
    startY: y,
    head: [['Day', 'Orders', 'Revenue']],
    body: [
      ...data.ordersTrend.map((row) => [
        row.label,
        String(row.orders),
        formatCurrency(row.revenue),
      ]),
      ['Total', String(trendTotalOrders), formatCurrency(trendTotalRevenue)],
    ],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y
  y = ensureSpace(doc, y + 10, 40)
  addSectionTitle(doc, 'Fleet status', y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Status', 'Drones']],
    body:
      data.fleetStatus.length > 0
        ? data.fleetStatus.map((row) => [row.label, String(row.value)])
        : [['No data', '0']],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y
  y = ensureSpace(doc, y + 10, 40)
  addSectionTitle(doc, 'Top restaurants by orders', y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Restaurant', 'Orders']],
    body:
      data.topRestaurants.length > 0
        ? data.topRestaurants.map((row) => [row.name, String(row.orders)])
        : [['No data', '0']],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  const dateStamp = data.generatedAt.toISOString().slice(0, 10)
  doc.save(`drones-analytics-${dateStamp}.pdf`)
}

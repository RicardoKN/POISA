import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Generate and download a branded weekly report PDF.
 */
export function generateReportPdf({ report, startDate, endDate }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  // ── Header ────────────────────────────────────────
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('POISA Retail Store', pageWidth / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Weekly Sales Report', pageWidth / 2, y, { align: 'center' })
  y += 6

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`${startDate}  to  ${endDate}`, pageWidth / 2, y, { align: 'center' })
  y += 4
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' })
  doc.setTextColor(0)
  y += 10

  // ── Sales Summary ─────────────────────────────────
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Sales Summary', 14, y)
  y += 2

  const s = report.summary
  doc.autoTable({
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Total Revenue', fmtBWP(s.revenue)],
      ['Transactions', String(s.transactions)],
      ['Average Sale', fmtBWP(s.avgSale)],
      ['Cost of Goods Sold', fmtBWP(s.cogs)],
      ['Gross Profit', fmtBWP(s.grossProfit)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  })
  y = doc.lastAutoTable.finalY + 10

  // ── Daily Breakdown ───────────────────────────────
  if (report.dailyBreakdown.length > 0) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Daily Breakdown', 14, y)
    y += 2

    doc.autoTable({
      startY: y,
      head: [['Date', 'Revenue', 'Transactions']],
      body: report.dailyBreakdown.map((d) => [
        d.date,
        fmtBWP(d.revenue),
        String(d.transactions),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // ── Top Products by Revenue ───────────────────────
  if (report.topByRevenue.length > 0) {
    checkPageBreak(doc, y, 60)
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Top 10 Products by Revenue', 14, y)
    y += 2

    doc.autoTable({
      startY: y,
      head: [['#', 'Product', 'Revenue', 'Units']],
      body: report.topByRevenue.map((p, i) => [
        String(i + 1),
        p.name,
        fmtBWP(p.total_revenue),
        String(p.total_units),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 10 }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // ── Stock Movement ────────────────────────────────
  if (report.stockMovement.length > 0) {
    checkPageBreak(doc, y, 60)
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Stock Movement', 14, y)
    y += 2

    doc.autoTable({
      startY: y,
      head: [['Product', 'Sold', 'Restocked', 'Current Stock']],
      body: report.stockMovement.map((r) => [
        r.name,
        String(r.sold),
        String(r.restocked),
        String(r.current_stock),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    })
  }

  // ── Footer ────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `POISA POS — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  doc.save(`weekly-report-${startDate}-to-${endDate}.pdf`)
}

function fmtBWP(amount) {
  return `BWP ${Number(amount).toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function checkPageBreak(doc, currentY, needed) {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (currentY + needed > pageHeight - 20) {
    doc.addPage()
  }
}

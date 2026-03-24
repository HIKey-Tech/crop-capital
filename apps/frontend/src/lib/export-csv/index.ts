export interface ExportColumn<T> {
  header: string
  value: (row: T, index: number) => string | number
}

function escape(val: string | number): string {
  const str = String(val)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

export function exportToCSV<T>(
  data: Array<T>,
  columns: Array<ExportColumn<T>>,
  filename: string,
): void {
  if (!data.length) return

  const header = columns.map((c) => escape(c.header)).join(',')
  const rows = data.map((row, index) =>
    columns.map((c) => escape(c.value(row, index))).join(','),
  )

  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${filename}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

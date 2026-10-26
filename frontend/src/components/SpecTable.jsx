// Rows without a value yet are hidden rather than shown as a placeholder.
export default function SpecTable({ rows, labelSize = '0.65rem' }) {
  return (
    <div className="divide-y divide-border">
      {rows.filter((row) => row.value != null && row.value !== '').map((row) => (
        <div key={row.label} className="flex justify-between items-baseline py-3 gap-4">
          <span className="text-muted md:shrink-0" style={{ fontSize: labelSize, letterSpacing: '0.12em' }}>
            {row.label}
          </span>
          <span className="text-foreground text-sm font-medium text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DirectionBadge({ arah }) {
  const isMasuk = arah === 'Masuk';
  return (
    <span
      className="inline-flex h-[22px] items-center rounded-full border px-2 text-[11px] font-medium"
      style={{
        color: isMasuk ? 'var(--almex-success)' : 'var(--almex-blue)',
        background: isMasuk ? 'var(--almex-success-soft)' : 'var(--almex-blue-soft)',
        borderColor: isMasuk ? '#d7efd9' : '#dbeafe',
      }}
    >
      {arah || '-'}
    </span>
  );
}

const typeStyles = {
  PDF: 'bg-[#e5484d]',
  DOC: 'bg-[var(--almex-accent)]',
  XLS: 'bg-[var(--almex-success)]',
};

function resolveType(filename = '') {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'XLS';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'DOC';
  return 'PDF';
}

export default function FileTypeBadge({ filename }) {
  const type = resolveType(filename);
  return (
    <span className={`grid h-[22px] w-[28px] place-items-center rounded-[5px] text-[9px] font-bold text-white ${typeStyles[type]}`}>
      {type}
    </span>
  );
}

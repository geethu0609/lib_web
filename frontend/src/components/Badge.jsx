const Badge = ({ status }) => {
  const map = {
    inactive:   'badge-inactive',
    active:     'badge-active',
    completed:  'badge-completed',
    pending:    'badge-pending',
    dismissed:  'badge-dismissed',
    confirmed:  'badge-confirmed',
    assignment: 'badge-assignment',
    alert:      'badge-alert',
  };
  const cls = map[status] || 'badge-inactive';
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
};

export default Badge;

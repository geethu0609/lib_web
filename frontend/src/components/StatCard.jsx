import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = '#6366f1', bg = '#eef2ff', sub }) => (
  <motion.div
    className="stat-card"
    style={{ '--card-color': color }}
    whileHover={{ y: -3 }}
    transition={{ duration: 0.2 }}
  >
    <div className="stat-icon-wrap" style={{ background: bg }}>
      <Icon size={20} color={color} strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
      {sub && <p className="text-xs mt-1 font-semibold" style={{ color }}>{sub}</p>}
    </div>
  </motion.div>
);

export default StatCard;

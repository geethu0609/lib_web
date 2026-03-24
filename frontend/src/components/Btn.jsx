import { motion } from 'framer-motion';

const variantMap = {
  primary: 'btn-primary',
  success: 'btn-success',
  danger:  'btn-danger',
  amber:   'btn-amber',
  ghost:   'btn-ghost',
  outline: 'btn-outline',
};
const sizeMap = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };

const Btn = ({ children, variant = 'primary', size = 'md', disabled, onClick, type = 'button', className = '', icon: Icon }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.025 } : {}}
    whileTap={!disabled ? { scale: 0.96 } : {}}
    transition={{ duration: 0.13 }}
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn ${variantMap[variant] || 'btn-primary'} ${sizeMap[size] || 'btn-md'} ${className}`}
  >
    {Icon && <Icon size={13} />}
    {children}
  </motion.button>
);

export default Btn;

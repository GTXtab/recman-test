import React from 'react';

export type IconButtonVariant = 'primary' | 'danger' | 'success' | 'warning' | 'secondary' | 'ghost' | 'delete' | 'edit';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: IconButtonVariant;
  className?: string;
}

const variantClasses: Record<IconButtonVariant, string> = {
  primary:   'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200',
  danger:    'px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors duration-200',
  success:   'px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors duration-200',
  warning:   'px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors duration-200',
  secondary: 'px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors duration-200',
  ghost:     'p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors duration-200',
  
  delete: 'p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors duration-200',
  edit:   'p-1.5 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors duration-200',
};

/*
 * IconButton component.
 * Renders a button with an icon and optional label, supporting multiple style variants.
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={[
      'inline-flex items-center gap-2 font-medium',
      variantClasses[variant],
      className
    ].join(' ')}
    {...rest}
  >
    {icon}
    {label && <span>{label}</span>}
  </button>
);

export default IconButton;
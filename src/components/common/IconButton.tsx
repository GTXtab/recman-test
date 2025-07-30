import React from 'react';

export type IconButtonVariant = 'primary' | 'danger' | 'success' | 'warning' | 'secondary' | 'ghost';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: IconButtonVariant;
  className?: string;
}

const variantClasses: Record<IconButtonVariant, string> = {
  primary:   'btn-primary',
  danger:    'btn-danger',
  success:   'btn-success',
  warning:   'btn-warning',
  secondary: 'btn-secondary',
  ghost:     'p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors duration-200',
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
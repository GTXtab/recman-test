import type { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger";
}

const variantClasses = {
  default: "hover:bg-gray-100 hover:text-gray-700",
  danger: "hover:bg-red-100 hover:text-red-600",
};

export const Button: FC<ButtonProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={
        "p-2 rounded-lg text-gray-500 transition-colors duration-200 " +
        variantClasses[variant] +
        " " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
};

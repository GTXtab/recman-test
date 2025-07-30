import type { FC, InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: "blue" | "green";
}

const colorClasses = {
  blue: "text-blue-600 focus:ring-blue-500",
  green: "text-green-600 focus:ring-green-500",
};

export const Checkbox: FC<CheckboxProps> = ({
  color = "blue",
  className,
  ...props
}) => {
  const baseClass = "rounded border-gray-300 h-4 w-4";
  return (
    <input
      type="checkbox"
      className={`${baseClass} ${colorClasses[color]}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};

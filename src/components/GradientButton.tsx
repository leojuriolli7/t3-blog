import React from "react";

type Props = {
  disabled?: boolean;
  onClick?: () => void;
  children: string | React.ReactNode;
  className?: string;
};

const GradientButton: React.FC<Props> = ({
  disabled,
  onClick,
  children,
  className,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`text-sm bg-gradient-to-tl from-green-400 via-emerald-400 dark:to-blue-800 to-blue-500 text-white bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-500 ${className}`}
    >
      {children}
    </button>
  );
};

export default GradientButton;

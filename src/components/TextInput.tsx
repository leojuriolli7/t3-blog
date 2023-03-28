import clsx from "clsx";
import React, { KeyboardEvent, ReactElement } from "react";
import ShouldRender from "./ShouldRender";

type InputSize = "base" | "lg";
type TextInputVariant = "outline" | "primary";

const INPUT_CLASS = "w-full block";

const INPUT_SIZES = {
  base: "sm:text-sm sm:leading-6 py-2 px-3.5",
  lg: "text-base p-3",
};

const INPUT_VARIANTS = {
  primary:
    "bg-white border-zinc-300 border-[1px] dark:border-neutral-800 dark:bg-neutral-900",
  outline:
    "text-gray-900 dark:text-neutral-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:bg-neutral-900 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
};

type InputStyle = {
  disabled?: boolean;
  sizeVariant?: InputSize;
  variant?: TextInputVariant;
  icon?: ReactElement;
};

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const getInputClasses = (style: InputStyle = {}, ...rest: string[]) => {
  const { disabled, sizeVariant = "base", variant = "outline", icon } = style;
  return clsx(
    INPUT_CLASS,
    INPUT_SIZES,
    disabled && "opacity-70 cursor-not-allowed",
    icon && "pl-10",
    INPUT_SIZES[sizeVariant],
    INPUT_VARIANTS[variant],
    ...rest
  );
};

type Props = {
  className?: string;
  onPressEnter?: () => void;
} & InputProps &
  InputStyle;

const TextInput = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    className = "",
    disabled,
    sizeVariant,
    variant,
    onPressEnter,
    icon,
    ...rest
  } = props;

  const handlePressEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Prevent form submission.
      e.preventDefault();
      onPressEnter?.();
    }
  };

  return (
    <div className="relative w-full">
      <ShouldRender if={icon}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon}
        </div>
      </ShouldRender>
      <input
        disabled={disabled}
        className={getInputClasses(
          { disabled, sizeVariant, variant, icon },
          className
        )}
        ref={ref}
        type="text"
        onKeyDown={handlePressEnter}
        {...rest}
      />
    </div>
  );
});

TextInput.displayName = "TextInput";

export default TextInput;

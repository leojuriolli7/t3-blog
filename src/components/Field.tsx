import { useAutoAnimate } from "@formkit/auto-animate/react";
import { FieldError } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import ShouldRender from "./ShouldRender";

type Props = {
  children: React.ReactNode;
  error?: FieldError;
  label?: string;
  description?: string;
};

const Field: React.FC<Props> = ({ children, error, label, description }) => {
  const [parentRef] = useAutoAnimate();
  return (
    <div className="relative flex w-full flex-col" ref={parentRef}>
      <ShouldRender if={label}>
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-neutral-100">
            {label}
          </label>
          <ShouldRender if={description}>
            <p className="block text-sm text-gray-700 dark:text-neutral-300">
              {description}
            </p>
          </ShouldRender>
        </div>
      </ShouldRender>
      <ErrorMessage error={error} />
      <div className="mt-1">{children}</div>
    </div>
  );
};

export default Field;

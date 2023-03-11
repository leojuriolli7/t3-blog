import { FieldError } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import ShouldRender from "./ShouldRender";

type Props = {
  children: React.ReactNode;
  error?: FieldError;
  label?: string;
};

const Field: React.FC<Props> = ({ children, error, label }) => {
  return (
    <div className="relative w-full flex flex-col">
      <ShouldRender if={label}>
        <label className="block text-sm font-semibold text-gray-900 dark:text-neutral-100">
          {label}
        </label>
      </ShouldRender>
      <ErrorMessage error={error} />
      <div className="mt-1">{children}</div>
    </div>
  );
};

export default Field;

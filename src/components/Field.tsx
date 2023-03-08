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
    <div className="w-full flex flex-col gap-2">
      <ErrorMessage error={error} />
      <div>
        <ShouldRender if={label}>
          <label className="block text-sm font-semibold leading-6 text-gray-900 dark:text-neutral-100">
            {label}
          </label>
        </ShouldRender>
        {children}
      </div>
    </div>
  );
};

export default Field;

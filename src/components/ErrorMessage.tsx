import { FieldError } from "react-hook-form";
import ShouldRender from "./ShouldRender";

type Props = {
  error?: FieldError;
};

const ErrorMessage: React.FC<Props> = ({ error }) => {
  return (
    <ShouldRender if={error}>
      <p className="text-red-600 dark:text-red-500 text-sm">{error?.message}</p>
    </ShouldRender>
  );
};

export default ErrorMessage;

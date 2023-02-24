import { FieldError } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";

type Props = {
  children: React.ReactNode;
  error?: FieldError;
};

const Field: React.FC<Props> = ({ children, error }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <ErrorMessage error={error} />
      {children}
    </div>
  );
};

export default Field;

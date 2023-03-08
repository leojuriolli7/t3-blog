import { Dispatch, SetStateAction, useCallback } from "react";
import { BsExclamationCircleFill } from "react-icons/bs";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";
import Spinner from "./Spinner";

type Props = {
  title: string;
  description: string;
  confirmationLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  icon?: React.ReactNode;
  loading?: boolean;
};

const ConfirmationModal: React.FC<Props> = ({
  title,
  description,
  confirmationLabel,
  onCancel,
  onConfirm,
  openState,
  icon,
  loading,
}) => {
  const [, setOpen] = openState;

  const handleClickCancel = useCallback(() => {
    if (onCancel) return onCancel?.();

    if (!onCancel) setOpen(false);
  }, [onCancel, setOpen]);

  return (
    <Modal openState={openState}>
      <div className="overflow-hidden bg-white dark:bg-neutral-900 px-4 pt-5 pb-4 shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
            <ShouldRender if={!icon}>
              <BsExclamationCircleFill size={25} className="text-red-500" />
            </ShouldRender>

            <ShouldRender if={icon}>{icon}</ShouldRender>
          </div>

          <div className="text-center sm:text-left">
            <Modal.Title
              as="h3"
              className="text-lg text-black dark:text-white font-medium leading-6"
            >
              {title}
            </Modal.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:mt-4 sm:flex-row-reverse">
          <button
            className="w-full justify-center sm:w-36 sm:text-sm border-2 dark:border-gray-200 border-neutral-500 text-neutral-600 dark:text-white p-2 hover:opacity-80 font-bold"
            onClick={onConfirm}
            disabled={loading}
          >
            <ShouldRender if={!loading}>{confirmationLabel}</ShouldRender>

            <ShouldRender if={loading}>
              <Spinner />
            </ShouldRender>
          </button>
          <button
            className="w-full justify-center sm:w-auto sm:text-sm font-bold border-red-500 bg-red-500 py-2 px-4 text-white hover:opacity-80"
            onClick={handleClickCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

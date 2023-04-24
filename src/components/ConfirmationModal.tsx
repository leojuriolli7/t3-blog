import { Dispatch, SetStateAction, useCallback } from "react";
import { BsExclamationCircleFill } from "react-icons/bs";
import Button from "./Button";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";

type Props = {
  title: string;
  description?: string;
  confirmationLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  icon?: React.ReactNode;
  loading?: boolean;
};

const ConfirmationModal: React.FC<Props> = ({
  title,
  description = "This action is permanent and cannot be undone!",
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
    <Modal openState={openState} hideCloseButton>
      <div className="overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 shadow-xl dark:bg-neutral-900 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
              className="text-lg font-medium leading-6 text-black dark:text-white"
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
          <Button
            loading={loading}
            variant="text"
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmationLabel}
          </Button>
          <Button
            variant="danger"
            onClick={handleClickCancel}
            disabled={loading}
            className="rounded-md"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

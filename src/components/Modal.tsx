import { Fragment, Dispatch, MutableRefObject, SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MdClose } from "react-icons/md";
import ShouldRender from "./ShouldRender";

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute z-[3] rounded-full top-0 right-0 p-2 bg-emerald-500 dark:bg-teal-900"
  >
    <MdClose className="w-5 h-5 text-white" />
  </button>
);

export const Modal: React.FC<{
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  initialFocus?: MutableRefObject<null>;
  children: React.ReactNode;
  alwaysCentered?: boolean;
  onClose?: () => void;
  closeButton?: boolean;
}> & {
  Title: typeof Dialog.Title;
  Description: typeof Dialog.Description;
} = ({
  openState,
  initialFocus,
  alwaysCentered = false,
  children,
  onClose,
  closeButton,
}) => {
  const [open, setOpen] = openState;

  const handleClose = () => {
    if (onClose) onClose();

    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] overflow-y-auto"
        initialFocus={initialFocus}
        onClose={handleClose}
      >
        <div
          className={`flex min-h-screen ${
            alwaysCentered ? "items-center" : "items-end"
          } justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0`}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/80 transition-opacity" />
          </Transition.Child>

          {/* This element tricks the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block text-left align-bottom sm:align-middle">
              <ShouldRender if={closeButton}>
                <CloseButton onClick={handleClose} />
              </ShouldRender>
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

Modal.Title = Dialog.Title;
Modal.Description = Dialog.Description;

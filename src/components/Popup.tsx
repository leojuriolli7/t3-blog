import { Popover, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { usePopper } from "react-popper";

type Props = {
  icon: React.ReactNode;
  children: React.ReactNode;
};

const Popup: React.FC<Props> = ({ icon, children }) => {
  let [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  let [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement);

  return (
    <Popover className="relative">
      <Popover.Button
        ref={(ref) => setReferenceElement(ref)}
        className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
      >
        {icon}
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          ref={(ref) => setPopperElement(ref)}
          style={styles.popper}
          {...attributes.popper}
          className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4"
        >
          {children}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default Popup;

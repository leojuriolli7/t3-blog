import { Popover, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { usePopper } from "react-popper";

type Props = {
  icon: React.ReactNode;
  children: React.ReactNode;
};

const CustomPopover: React.FC<Props> = ({ icon, children }) => {
  let [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  let [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    strategy: "fixed",
  });

  return (
    <Popover className="relative flex items-center z-50">
      <Popover.Button
        ref={(ref) => setReferenceElement(ref)}
        className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
      >
        {icon}
      </Popover.Button>

      <Transition
        enter="transition duration-75 ease-in"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
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

export default CustomPopover;
